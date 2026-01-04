import { expect } from "chai";
import { ethers } from "hardhat";

describe("Market", function () {
  let market: Market;
  let owner: any;
  let user1: any;
  let user2: any;
  const question = "Will BTC reach $100k?";
  const resolutionTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MarketFactory = await ethers.getContractFactory("Market");
    market = await MarketFactory.deploy(
      question,
      resolutionTime,
      owner.address,
      owner.address, // oracle
      0 // marketId
    );
    await market.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct question", async function () {
      expect(await market.question()).to.equal(question);
    });

    it("Should set correct resolution time", async function () {
      expect(await market.resolutionTime()).to.equal(resolutionTime);
    });

    it("Should deploy Yes and No tokens", async function () {
      const yesTokenAddress = await market.yesToken();
      const noTokenAddress = await market.noToken();

      expect(yesTokenAddress).to.not.equal(ethers.ZeroAddress);
      expect(noTokenAddress).to.not.equal(ethers.ZeroAddress);

      const YesToken = await ethers.getContractAt("ShareToken", yesTokenAddress);
      const NoToken = await ethers.getContractAt("ShareToken", noTokenAddress);

      expect(await YesToken.name()).to.equal("Yes Share");
      expect(await YesToken.symbol()).to.equal("YES");
      expect(await NoToken.name()).to.equal("No Share");
      expect(await NoToken.symbol()).to.equal("NO");
    });

    it("Should start with unresolved status", async function () {
      expect(await market.resolutionStatus()).to.equal(0); // Unresolved
    });
  });

  describe("addLiquidity", function () {
    it("Should add initial liquidity", async function () {
      const yesAmount = ethers.parseEther("1000");
      const noAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");

      await expect(
        market.connect(user1).addLiquidity(yesAmount, noAmount, { value: ethAmount })
      ).to.emit(market, "LiquidityAdded");

      expect(await market.balanceOf(user1.address)).to.be.gt(0);
    });

    it("Should mint Yes and No tokens to provider", async function () {
      const yesAmount = ethers.parseEther("1000");
      const noAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");

      await market.connect(user1).addLiquidity(yesAmount, noAmount, { value: ethAmount });

      const yesTokenAddress = await market.yesToken();
      const noTokenAddress = await market.noToken();
      const YesToken = await ethers.getContractAt("ShareToken", yesTokenAddress);
      const NoToken = await ethers.getContractAt("ShareToken", noTokenAddress);

      expect(await YesToken.balanceOf(user1.address)).to.equal(yesAmount);
      expect(await NoToken.balanceOf(user1.address)).to.equal(noAmount);
    });
  });

  describe("buyYes / buyNo", function () {
    beforeEach(async function () {
      // Add initial liquidity first
      const yesAmount = ethers.parseEther("1000");
      const noAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");
      await market.connect(user1).addLiquidity(yesAmount, noAmount, { value: ethAmount });
    });

    it("Should allow buying Yes shares", async function () {
      const ethAmount = ethers.parseEther("0.1");

      await expect(market.connect(user2).buyYes({ value: ethAmount }))
        .to.emit(market, "SharesBought");

      const yesTokenAddress = await market.yesToken();
      const YesToken = await ethers.getContractAt("ShareToken", yesTokenAddress);
      expect(await YesToken.balanceOf(user2.address)).to.be.gt(0);
    });

    it("Should allow buying No shares", async function () {
      const ethAmount = ethers.parseEther("0.1");

      await expect(market.connect(user2).buyNo({ value: ethAmount }))
        .to.emit(market, "SharesBought");

      const noTokenAddress = await market.noToken();
      const NoToken = await ethers.getContractAt("ShareToken", noTokenAddress);
      expect(await NoToken.balanceOf(user2.address)).to.be.gt(0);
    });
  });

  describe("resolve", function () {
    it("Should allow owner to resolve market as Yes", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(market.connect(owner).resolve(true))
        .to.emit(market, "MarketResolved")
        .withArgs(1); // Yes = 1

      expect(await market.resolutionStatus()).to.equal(1); // Yes
    });

    it("Should allow owner to resolve market as No", async function () {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(market.connect(owner).resolve(false))
        .to.emit(market, "MarketResolved")
        .withArgs(2); // No = 2

      expect(await market.resolutionStatus()).to.equal(2); // No
    });

    it("Should prevent resolution before resolution time", async function () {
      await expect(market.connect(owner).resolve(true))
        .to.be.revertedWith("Resolution time not reached");
    });

    it("Should prevent non-authorized from resolving", async function () {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(market.connect(user1).resolve(true))
        .to.be.revertedWith("OwnableUnauthorizedAccount");
    });

    it("Should prevent double resolution", async function () {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await market.connect(owner).resolve(true);
      await expect(market.connect(owner).resolve(false))
        .to.be.revertedWith("Already resolved");
    });
  });

  describe("redeem - Yes payout", function () {
    beforeEach(async function () {
      // Setup: Add liquidity and users buy shares
      const yesAmount = ethers.parseEther("1000");
      const noAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");
      await market.connect(user1).addLiquidity(yesAmount, noAmount, { value: ethAmount });

      // User2 buys Yes shares
      await market.connect(user2).buyYes({ value: ethers.parseEther("0.1") });

      // Resolve as Yes
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      await market.connect(owner).resolve(true);
    });

    it("Should allow redeeming Yes shares after Yes resolution", async function () {
      const yesTokenAddress = await market.yesToken();
      const YesToken = await ethers.getContractAt("ShareToken", yesTokenAddress);
      const yesBalance = await YesToken.balanceOf(user2.address);
      expect(yesBalance).to.be.gt(0);

      const balanceBefore = await ethers.provider.getBalance(user2.address);
      const tx = await market.connect(user2).redeem(true, yesBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user2.address);

      // User should receive ETH
      expect(balanceAfter + gasUsed - balanceBefore).to.be.gt(0);
      expect(await YesToken.balanceOf(user2.address)).to.equal(0);
    });

    it("Should prevent redeeming No shares after Yes resolution", async function () {
      const noTokenAddress = await market.noToken();
      const NoToken = await ethers.getContractAt("ShareToken", noTokenAddress);
      
      // User1 has No shares from liquidity
      const noBalance = await NoToken.balanceOf(user1.address);
      expect(noBalance).to.be.gt(0);

      await expect(
        market.connect(user1).redeem(false, noBalance)
      ).to.be.revertedWith("Cannot redeem losing shares");
    });
  });

  describe("redeem - No payout", function () {
    beforeEach(async function () {
      // Setup: Add liquidity and users buy shares
      const yesAmount = ethers.parseEther("1000");
      const noAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");
      await market.connect(user1).addLiquidity(yesAmount, noAmount, { value: ethAmount });

      // User2 buys No shares
      await market.connect(user2).buyNo({ value: ethers.parseEther("0.1") });

      // Resolve as No
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      await market.connect(owner).resolve(false);
    });

    it("Should allow redeeming No shares after No resolution", async function () {
      const noTokenAddress = await market.noToken();
      const NoToken = await ethers.getContractAt("ShareToken", noTokenAddress);
      const noBalance = await NoToken.balanceOf(user2.address);
      expect(noBalance).to.be.gt(0);

      const balanceBefore = await ethers.provider.getBalance(user2.address);
      const tx = await market.connect(user2).redeem(false, noBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user2.address);

      // User should receive ETH
      expect(balanceAfter + gasUsed - balanceBefore).to.be.gt(0);
      expect(await NoToken.balanceOf(user2.address)).to.equal(0);
    });

    it("Should prevent redeeming Yes shares after No resolution", async function () {
      const yesTokenAddress = await market.yesToken();
      const YesToken = await ethers.getContractAt("ShareToken", yesTokenAddress);
      
      // User1 has Yes shares from liquidity
      const yesBalance = await YesToken.balanceOf(user1.address);
      expect(yesBalance).to.be.gt(0);

      await expect(
        market.connect(user1).redeem(true, yesBalance)
      ).to.be.revertedWith("Cannot redeem losing shares");
    });
  });

  describe("oracle placeholders", function () {
    it("Should allow setting oracle addresses", async function () {
      const chainlinkAddr = ethers.Wallet.createRandom().address;
      const umaAddr = ethers.Wallet.createRandom().address;

      await market.connect(owner).setOracleAddresses(chainlinkAddr, umaAddr);
      expect(await market.chainlinkPriceFeed()).to.equal(chainlinkAddr);
      expect(await market.umaOracle()).to.equal(umaAddr);
    });

    it("Should prevent non-owner from setting oracle addresses", async function () {
      const chainlinkAddr = ethers.Wallet.createRandom().address;
      const umaAddr = ethers.Wallet.createRandom().address;

      await expect(
        market.connect(user1).setOracleAddresses(chainlinkAddr, umaAddr)
      ).to.be.revertedWith("OwnableUnauthorizedAccount");
    });
  });
});

