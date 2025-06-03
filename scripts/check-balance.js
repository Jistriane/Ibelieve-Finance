const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Endereço da carteira:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Saldo em ETH:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 