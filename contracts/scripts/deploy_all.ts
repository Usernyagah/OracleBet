import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const explorerBaseUrl = "https://explorer.sepolia.mantle.xyz/address";

  console.log("Deploying OracleBet contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT");

  // Deploy PredictionFactory
  console.log("\n=== Deploying PredictionFactory ===");
  const PredictionFactory = await ethers.getContractFactory("PredictionFactory");
  const factory = await PredictionFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("PredictionFactory deployed to:", factoryAddress);
  console.log(`Factory Explorer: ${explorerBaseUrl}/${factoryAddress}`);

  // Create sample markets
  console.log("\n=== Creating Sample Markets ===");

  // Market 1: MNT > $2 by Q1 2026?
  const title1 = "MNT > $2 by Q1 2026?";
  const description1 = "Will Mantle Network token (MNT) reach $2 USD by Q1 2026?";
  const resolutionTime1 = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60; // 90 days from now

  console.log("\nCreating Market 1:", title1);
  const tx1 = await factory.createMarket(title1, description1, resolutionTime1);
  const receipt1 = await tx1.wait();
  const marketCreatedEvent1 = receipt1?.logs.find(
    (log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    }
  );
  let marketAddress1 = "Not found";
  if (marketCreatedEvent1) {
    const parsed = factory.interface.parseLog(marketCreatedEvent1);
    marketAddress1 = parsed?.args[0] || "Not found";
  }
  console.log("Market 1 deployed to:", marketAddress1);
  console.log(`Market 1 Explorer: ${explorerBaseUrl}/${marketAddress1}`);

  // Market 2: Bitcoin hits $150k in 2026?
  const title2 = "Bitcoin hits $150k in 2026?";
  const description2 = "Will Bitcoin (BTC) reach $150,000 USD in 2026?";
  const resolutionTime2 = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now

  console.log("\nCreating Market 2:", title2);
  const tx2 = await factory.createMarket(title2, description2, resolutionTime2);
  const receipt2 = await tx2.wait();
  const marketCreatedEvent2 = receipt2?.logs.find(
    (log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    }
  );
  let marketAddress2 = "Not found";
  if (marketCreatedEvent2) {
    const parsed = factory.interface.parseLog(marketCreatedEvent2);
    marketAddress2 = parsed?.args[0] || "Not found";
  }
  console.log("Market 2 deployed to:", marketAddress2);
  console.log(`Market 2 Explorer: ${explorerBaseUrl}/${marketAddress2}`);

  // Market 3: Mantle TVL > $1B?
  const title3 = "Mantle TVL > $1B?";
  const description3 = "Will Mantle Network Total Value Locked (TVL) exceed $1 billion by Q2 2026?";
  const resolutionTime3 = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60; // 6 months from now

  console.log("\nCreating Market 3:", title3);
  const tx3 = await factory.createMarket(title3, description3, resolutionTime3);
  const receipt3 = await tx3.wait();
  const marketCreatedEvent3 = receipt3?.logs.find(
    (log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    }
  );
  let marketAddress3 = "Not found";
  if (marketCreatedEvent3) {
    const parsed = factory.interface.parseLog(marketCreatedEvent3);
    marketAddress3 = parsed?.args[0] || "Not found";
  }
  console.log("Market 3 deployed to:", marketAddress3);
  console.log(`Market 3 Explorer: ${explorerBaseUrl}/${marketAddress3}`);

  // Get all markets
  const allMarkets = await factory.getAllMarkets();

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("PredictionFactory Address:", factoryAddress);
  console.log("Total Markets Created:", allMarkets.length.toString());
  console.log("\nAll Market Addresses:");
  allMarkets.forEach((market: string, index: number) => {
    console.log(`  Market ${index + 1}: ${market}`);
  });

  // Export for frontend
  console.log("\n=== Export for Frontend ===");
  const deploymentData = {
    factory: factoryAddress,
    markets: allMarkets,
    network: "mantle_testnet",
    chainId: 5003,
    explorer: "https://explorer.sepolia.mantle.xyz"
  };

  // Output JSON
  console.log(JSON.stringify(deploymentData, null, 2));

  // Write frontend.env file
  const envContent = `# OracleBet Contract Addresses - Mantle Sepolia Testnet
# Generated: ${new Date().toISOString()}

FACTORY_ADDRESS=${factoryAddress}
CHAIN_ID=5003
NETWORK_NAME=mantle_testnet
EXPLORER_URL=https://explorer.sepolia.mantle.xyz
RPC_URL=https://rpc.sepolia.mantle.xyz

# Market Addresses (comma-separated)
MARKET_ADDRESSES=${allMarkets.join(",")}

# Market Count
MARKET_COUNT=${allMarkets.length}
`;

  const envPath = path.join(__dirname, "..", "frontend.env");
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✓ Frontend env file created at: ${envPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
