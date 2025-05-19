import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Configuração do provedor
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  
  // Usa a primeira conta do Hardhat como deployer
  const deployer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  console.log('Deployando contrato com a conta:', deployer.address);

  // Carrega o bytecode e ABI do contrato
  const contractPath = path.join(__dirname, '../artifacts/contracts/ProofRegistry.sol/ProofRegistry.json');
  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const contractBytecode = contractJson.bytecode;
  const contractAbi = contractJson.abi;

  // Cria uma instância do contrato
  const ProofRegistry = new ethers.ContractFactory(
    contractAbi,
    contractBytecode,
    deployer
  );

  // Implanta o contrato
  console.log('Iniciando deploy do contrato...');
  const proofRegistry = await ProofRegistry.deploy();
  await proofRegistry.deployed();

  console.log('Contrato implantado com sucesso!');
  console.log('Endereço do contrato:', proofRegistry.address);

  // Atualiza o arquivo .env-dev com o novo endereço
  const envPath = path.join(__dirname, '../.env-dev');
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(
    /PROOF_REGISTRY_ADDRESS=.*/,
    `PROOF_REGISTRY_ADDRESS=${proofRegistry.address}`
  );
  fs.writeFileSync(envPath, envContent);

  console.log('Arquivo .env-dev atualizado com o novo endereço do contrato');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 