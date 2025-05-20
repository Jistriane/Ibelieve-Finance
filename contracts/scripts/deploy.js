const hre = require("hardhat");

async function main() {
  console.log("Iniciando deploy do contrato ProofRegistry...");

  const ProofRegistry = await hre.ethers.getContractFactory("ProofRegistry");
  const proofRegistry = await ProofRegistry.deploy();

  // Aguarda a transação ser minerada
  await proofRegistry.waitForDeployment();

  const address = await proofRegistry.getAddress();
  console.log("ProofRegistry deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 