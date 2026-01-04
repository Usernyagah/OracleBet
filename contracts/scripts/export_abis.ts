import * as fs from "fs";
import * as path from "path";

async function main() {
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const outputDir = path.join(__dirname, "..", "abis");

  // Create abis directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const contracts = ["Factory", "Market"];

  const abis: Record<string, any> = {};

  for (const contractName of contracts) {
    const contractPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
    
    if (fs.existsSync(contractPath)) {
      const artifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
      const abi = artifact.abi;
      
      // Write individual ABI file
      const abiPath = path.join(outputDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
      
      abis[contractName] = abi;
      
      console.log(`✓ Exported ${contractName}.json`);
    } else {
      console.warn(`⚠ Contract artifact not found: ${contractName}`);
    }
  }

  // Write combined ABIs file
  const combinedPath = path.join(outputDir, "index.json");
  fs.writeFileSync(combinedPath, JSON.stringify(abis, null, 2));
  
  console.log(`\n✓ Exported all ABIs to ${outputDir}`);
  console.log(`✓ Combined ABIs exported to ${combinedPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

