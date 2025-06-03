import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log("Iniciando deploy dos contratos...");

    // Obtém as contas disponíveis
    const [deployer] = await ethers.getSigners();
    console.log("Deployando contratos com a conta:", deployer.address);

    // Array para armazenar os endereços dos contratos
    const deployedContracts: { [key: string]: string } = {};

    try {
        // Deploy do SubwalletRegistry
        console.log("\nDeployando SubwalletRegistry...");
        const SubwalletRegistry = await ethers.getContractFactory("SubwalletRegistry");
        const subwalletRegistry = await SubwalletRegistry.deploy(deployer.address);
        await subwalletRegistry.deployed();
        deployedContracts['SubwalletRegistry'] = subwalletRegistry.address;
        console.log("SubwalletRegistry deployado em:", subwalletRegistry.address);

        // Deploy do ACMEToken
        console.log("\nDeployando ACMEToken...");
        const ACMEToken = await ethers.getContractFactory("ACMEToken");
        const acmeToken = await ACMEToken.deploy(deployer.address, subwalletRegistry.address);
        await acmeToken.deployed();
        deployedContracts['ACMEToken'] = acmeToken.address;
        console.log("ACMEToken deployado em:", acmeToken.address);

        // Deploy do ZKProofRegistry
        console.log("\nDeployando ZKProofRegistry...");
        const ZKProofRegistry = await ethers.getContractFactory("ZKProofRegistry");
        const zkProofRegistry = await ZKProofRegistry.deploy(
            acmeToken.address,
            subwalletRegistry.address,
            deployer.address
        );
        await zkProofRegistry.deployed();
        deployedContracts['ZKProofRegistry'] = zkProofRegistry.address;
        console.log("ZKProofRegistry deployado em:", zkProofRegistry.address);

        // Configura o ZKProofRegistry no ACMEToken
        console.log("\nConfigurando ZKProofRegistry no ACMEToken...");
        await acmeToken.setZKProofRegistry(zkProofRegistry.address);
        console.log("ZKProofRegistry configurado no ACMEToken");

        // Salva os endereços em um arquivo
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }

        const network = process.env.REACT_APP_NETWORK_NAME || 'sepolia';
        const deploymentFile = path.join(deploymentPath, `${network}.json`);
        
        fs.writeFileSync(
            deploymentFile,
            JSON.stringify(
                {
                    network,
                    deployer: deployer.address,
                    timestamp: new Date().toISOString(),
                    contracts: deployedContracts
                },
                null,
                2
            )
        );

        console.log("\nTodos os contratos foram deployados com sucesso!");
        console.log(`Detalhes salvos em: ${deploymentFile}`);

        // Atualiza o arquivo .env-dev com o endereço do ZKProofRegistry
        const envPath = path.join(__dirname, '../.env-dev');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
            /REACT_APP_ZKPROOF_CONTRACT_ADDRESS=.*/,
            `REACT_APP_ZKPROOF_CONTRACT_ADDRESS=${zkProofRegistry.address}`
        );
        fs.writeFileSync(envPath, envContent);
        console.log("\nArquivo .env-dev atualizado com o endereço do ZKProofRegistry");

    } catch (error) {
        console.error("Erro durante o deploy:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 