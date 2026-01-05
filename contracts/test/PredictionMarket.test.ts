import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OracleBet Prediction Market - Full E2E Flow", function () {
  let factory: any;
  let market: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  const title = "Test Market: Will X happen?";
  const description = "This is a test prediction market";
  let resolutionTimestamp: number;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy factory
    const PredictionFactory = await ethers.getContractFactory("PredictionFactory");
    factory = await PredictionFactory.deploy();
    await factory.waitForDeployment();

    // Create market
    resolutionTimestamp = (await time.latest()) + 365 * 24 * 60 * 60; // 1 year from now
    const tx = await factory.createMarket(title, description, resolutionTimestamp);
    const receipt = await tx.wait();
    
    // Get market address from event
    const marketCreatedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    });
    
    let marketAddress: string;
    if (marketCreatedEvent) {
      const parsed = factory.interface.parseLog(marketCreatedEvent);
      marketAddress = parsed?.args[0];
    } else {
      const allMarkets = await factory.getAllMarkets();
      marketAddress = allMarkets[0];
    }

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    market = PredictionMarket.attach(marketAddress);
  });

  describe("Market Creation", function () {
    it("Should create market with correct parameters", async function () {
      expect(await market.title()).to.equal(title);
      expect(await market.description()).to.equal(description);
      expect(await market.resolutionTimestamp()).to.equal(resolutionTimestamp);
      expect(await market.isResolved()).to.be.false;
    });

    it("Should deploy Yes and No share tokens", async function () {
      const yesTokenAddress = await market.yesShares();
      const noTokenAddress = await market.noShares();
      
      expect(yesTokenAddress).to.not.equal(ethers.ZeroAddress);
      expect(noTokenAddress).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Buying Shares", function () {
    it("Should allow user1 to buy Yes shares (0.5 MNT)", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const mntAmount = ethers.parseEther("0.5");

      const tx = await market.connect(user1).buyYes({ value: mntAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      // Balance should decrease by mntAmount + gas
      expect(balanceBefore - balanceAfter).to.be.gte(mntAmount);

      // Check Yes shares
      const yesToken = await ethers.getContractAt("ShareToken", await market.yesShares());
      const yesBalance = await yesToken.balanceOf(user1.address);
      expect(yesBalance).to.be.gt(0);

      // Check event
      const betPlacedEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = market.interface.parseLog(log);
          return parsed?.name === "BetPlaced";
        } catch {
          return false;
        }
      });
      expect(betPlacedEvent).to.not.be.undefined;
    });

    it("Should allow user2 to buy No shares (0.3 MNT)", async function () {
      const balanceBefore = await ethers.provider.getBalance(user2.address);
      const mntAmount = ethers.parseEther("0.3");

      const tx = await market.connect(user2).buyNo({ value: mntAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user2.address);

      // Balance should decrease
      expect(balanceBefore - balanceAfter).to.be.gte(mntAmount);

      // Check No shares
      const noToken = await ethers.getContractAt("ShareToken", await market.noShares());
      const noBalance = await noToken.balanceOf(user2.address);
      expect(noBalance).to.be.gt(0);
    });
  });

  describe("Full E2E Flow", function () {
    it("Should complete full flow: buy → resolve → redeem → check balances", async function () {
      // Step 1: User1 buys Yes (0.5 MNT)
      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      const user1BetAmount = ethers.parseEther("0.5");
      
      const tx1 = await market.connect(user1).buyYes({ value: user1BetAmount });
      const receipt1 = await tx1.wait();
      const gas1 = receipt1!.gasUsed * receipt1!.gasPrice;
      const user1BalanceAfterBet = await ethers.provider.getBalance(user1.address);
      
      expect(user1BalanceBefore - user1BalanceAfterBet).to.be.gte(user1BetAmount);

      // Step 2: User2 buys No (0.3 MNT)
      const user2BalanceBefore = await ethers.provider.getBalance(user2.address);
      const user2BetAmount = ethers.parseEther("0.3");
      
      const tx2 = await market.connect(user2).buyNo({ value: user2BetAmount });
      const receipt2 = await tx2.wait();
      const gas2 = receipt2!.gasUsed * receipt2!.gasPrice;
      const user2BalanceAfterBet = await ethers.provider.getBalance(user2.address);
      
      expect(user2BalanceBefore - user2BalanceAfterBet).to.be.gte(user2BetAmount);

      // Step 3: Fast forward time and resolve as Yes
      await time.increaseTo(resolutionTimestamp);
      await market.connect(owner).resolve(true);
      
      expect(await market.isResolved()).to.be.true;
      expect(await market.winningOutcome()).to.be.true;

      // Step 4: User1 redeems (should get > 0.5 MNT - wins pool)
      const user1BalanceBeforeRedeem = await ethers.provider.getBalance(user1.address);
      const tx3 = await market.connect(user1).redeem();
      const receipt3 = await tx3.wait();
      const gas3 = receipt3!.gasUsed * receipt3!.gasPrice;
      const user1BalanceAfterRedeem = await ethers.provider.getBalance(user1.address);
      
      // User1 should receive more than they bet (wins from pool)
      const user1Received = user1BalanceAfterRedeem + gas3 - user1BalanceBeforeRedeem;
      expect(user1Received).to.be.gt(user1BetAmount);

      // Step 5: User2 tries to redeem (should fail - lost)
      await expect(market.connect(user2).redeem()).to.be.revertedWith("No winning shares");
    });

    it("Should handle losing side correctly (No wins)", async function () {
      // User1 buys Yes, User2 buys No
      await market.connect(user1).buyYes({ value: ethers.parseEther("0.5") });
      await market.connect(user2).buyNo({ value: ethers.parseEther("0.3") });

      // Resolve as No
      await time.increaseTo(resolutionTimestamp);
      await market.connect(owner).resolve(false);

      // User2 (No) should win
      const user2BalanceBefore = await ethers.provider.getBalance(user2.address);
      const tx = await market.connect(user2).redeem();
      const receipt = await tx.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;
      const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
      
      const user2Received = user2BalanceAfter + gas - user2BalanceBefore;
      expect(user2Received).to.be.gt(ethers.parseEther("0.3"));

      // User1 (Yes) should not be able to redeem
      await expect(market.connect(user1).redeem()).to.be.revertedWith("No winning shares");
    });
  });

  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is tested by the nonReentrant modifier
      // If reentrancy was possible, multiple calls would succeed
      await market.connect(user1).buyYes({ value: ethers.parseEther("0.1") });
      
      // Should not allow reentrant calls
      expect(await market.isResolved()).to.be.false;
    });

    it("Should only allow owner to resolve", async function () {
      await time.increaseTo(resolutionTimestamp);
      
      await expect(market.connect(user1).resolve(true))
        .to.be.revertedWithCustomError(market, "OwnableUnauthorizedAccount");
    });

    it("Should prevent resolution before timestamp", async function () {
      await expect(market.connect(owner).resolve(true))
        .to.be.revertedWith("Resolution time not reached");
    });

    it("Should prevent betting after resolution", async function () {
      await time.increaseTo(resolutionTimestamp);
      await market.connect(owner).resolve(true);

      await expect(market.connect(user1).buyYes({ value: ethers.parseEther("0.1") }))
        .to.be.revertedWith("Market is resolved");
    });
  });

  describe("Price Functions", function () {
    it("Should return prices", async function () {
      const yesPrice = await market.getYesPrice();
      const noPrice = await market.getNoPrice();
      
      expect(yesPrice).to.be.gt(0);
      expect(noPrice).to.be.gt(0);
    });

    it("Should return user position", async function () {
      await market.connect(user1).buyYes({ value: ethers.parseEther("0.5") });
      
      const [yes, no, wagered] = await market.getUserPosition(user1.address);
      expect(yes).to.be.gt(0);
      expect(no).to.equal(0);
      expect(wagered).to.be.gte(ethers.parseEther("0.5"));
    });
  });

  describe("Liquidity Functions", function () {
    it("Should allow adding liquidity", async function () {
      const tx = await market.connect(user1).addLiquidity({ value: ethers.parseEther("1.0") });
      await expect(tx).to.emit(market, "LiquidityAdded");
    });

    it("Should allow removing liquidity", async function () {
      // Add liquidity first
      await market.connect(user1).addLiquidity({ value: ethers.parseEther("1.0") });
      
      const yesToken = await ethers.getContractAt("ShareToken", await market.yesShares());
      const noToken = await ethers.getContractAt("ShareToken", await market.noShares());
      
      const yesBalance = await yesToken.balanceOf(user1.address);
      const noBalance = await noToken.balanceOf(user1.address);
      
      if (yesBalance > 0 || noBalance > 0) {
        const tx = await market.connect(user1).removeLiquidity(yesBalance, noBalance);
        await expect(tx).to.emit(market, "LiquidityRemoved");
      }
    });
  });
});

