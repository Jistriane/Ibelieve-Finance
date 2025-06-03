import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Endereço da conta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Saldo em ETH:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 