import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const explorerBaseUrl = "https://explorer.sepolia.mantle.xyz/address";

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Factory
  console.log("\n=== Deploying Factory ===");
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("Factory deployed to:", factoryAddress);
  console.log(`Factory Explorer: ${explorerBaseUrl}/${factoryAddress}`);

  // Create sample markets
  console.log("\n=== Creating Sample Markets ===");

  // Market 1: Will BTC reach $100k by end of 2024?
  const question1 = "Will BTC reach $100,000 by December 31, 2024?";
  const resolutionTime1 = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
  const oracle1 = deployer.address; // Placeholder oracle

  console.log("\nCreating Market 1:", question1);
  const tx1 = await factory.createMarket(question1, resolutionTime1, oracle1);
  const receipt1 = await tx1.wait();
  const marketCreatedEvent1 = receipt1?.logs.find(
    (log: any) => log.fragment?.name === "MarketCreated"
  );
  const marketAddress1 = marketCreatedEvent1?.args?.market || "Not found";
  console.log("Market 1 deployed to:", marketAddress1);
  console.log(`Market 1 Explorer: ${explorerBaseUrl}/${marketAddress1}`);

  // Market 2: Will ETH hit $5k in 2024?
  const question2 = "Will ETH reach $5,000 in 2024?";
  const resolutionTime2 = Math.floor(Date.now() / 1000) + 300 * 24 * 60 * 60; // ~10 months from now
  const oracle2 = deployer.address;

  console.log("\nCreating Market 2:", question2);
  const tx2 = await factory.createMarket(question2, resolutionTime2, oracle2);
  const receipt2 = await tx2.wait();
  const marketCreatedEvent2 = receipt2?.logs.find(
    (log: any) => log.fragment?.name === "MarketCreated"
  );
  const marketAddress2 = marketCreatedEvent2?.args?.market || "Not found";
  console.log("Market 2 deployed to:", marketAddress2);
  console.log(`Market 2 Explorer: ${explorerBaseUrl}/${marketAddress2}`);

  // Market 3: Will Mantle TVL exceed $1B?
  const question3 = "Will Mantle Network TVL exceed $1 billion by Q2 2024?";
  const resolutionTime3 = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60; // 6 months from now
  const oracle3 = deployer.address;

  console.log("\nCreating Market 3:", question3);
  const tx3 = await factory.createMarket(question3, resolutionTime3, oracle3);
  const receipt3 = await tx3.wait();
  const marketCreatedEvent3 = receipt3?.logs.find(
    (log: any) => log.fragment?.name === "MarketCreated"
  );
  const marketAddress3 = marketCreatedEvent3?.args?.market || "Not found";
  console.log("Market 3 deployed to:", marketAddress3);
  console.log(`Market 3 Explorer: ${explorerBaseUrl}/${marketAddress3}`);

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("Factory Address:", factoryAddress);
  console.log("Market Count:", (await factory.getMarketCount()).toString());
  console.log("\nAll Markets:");
  const allMarkets = await factory.getAllMarkets();
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

  // Write .env.local file for frontend
  const envContent = `# OracleBet Contract Addresses - Mantle Sepolia Testnet
# Generated: ${new Date().toISOString()}

VITE_FACTORY_ADDRESS=${factoryAddress}
VITE_CHAIN_ID=5003
VITE_NETWORK_NAME=mantle_testnet
VITE_EXPLORER_URL=https://explorer.sepolia.mantle.xyz
VITE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Market Addresses (comma-separated)
VITE_MARKET_ADDRESSES=${allMarkets.join(",")}

# Market Count
VITE_MARKET_COUNT=${allMarkets.length}
`;

  const envPath = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✓ Frontend .env.local file created at: ${envPath}`);
  console.log("\n⚠️  Remember to add .env.local to .gitignore if not already present!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

