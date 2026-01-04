import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", function () {
  let factory: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const FactoryFactory = await ethers.getContractFactory("Factory");
    factory = await FactoryFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy factory with zero markets", async function () {
      expect(await factory.getMarketCount()).to.equal(0);
      expect(await factory.getAllMarkets()).to.be.an("array").that.is.empty;
    });
  });

  describe("createMarket", function () {
    it("Should create a new market", async function () {
      const question = "Will BTC reach $100k?";
      const resolutionTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      const oracle = owner.address;

      const tx = await factory.createMarket(question, resolutionTime, oracle);
      const receipt = await tx.wait();

      expect(await factory.getMarketCount()).to.equal(1);
      expect(await factory.getAllMarkets()).to.have.lengthOf(1);

      // Check event
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      );
      expect(event).to.not.be.undefined;
    });

    it("Should track multiple markets", async function () {
      const question1 = "Question 1?";
      const question2 = "Question 2?";
      const resolutionTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await factory.createMarket(question1, resolutionTime, owner.address);
      await factory.createMarket(question2, resolutionTime, owner.address);

      expect(await factory.getMarketCount()).to.equal(2);
      expect(await factory.getAllMarkets()).to.have.lengthOf(2);
    });

    it("Should mark created markets as valid", async function () {
      const question = "Test question?";
      const resolutionTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      const tx = await factory.createMarket(question, resolutionTime, owner.address);
      const receipt = await tx.wait();

      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      );
      const marketAddress = event?.args?.market;

      expect(await factory.isMarket(marketAddress)).to.be.true;
    });
  });
});

