import { run } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log("Iniciando verificação dos contratos no Etherscan...");

    try {
        const network = process.env.REACT_APP_NETWORK_NAME || 'sepolia';
        const deploymentPath = path.join(__dirname, '../deployments', `${network}.json`);

        if (!fs.existsSync(deploymentPath)) {
            throw new Error(`Arquivo de deployment não encontrado: ${deploymentPath}`);
        }

        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const contracts = deployment.contracts;
        const deployer = deployment.deployer;

        // Verifica SubwalletRegistry
        if (contracts.SubwalletRegistry) {
            console.log("\nVerificando SubwalletRegistry...");
            try {
                await run("verify:verify", {
                    address: contracts.SubwalletRegistry,
                    constructorArguments: [deployer]
                });
                console.log("SubwalletRegistry verificado com sucesso!");
            } catch (error: any) {
                if (error.message.includes("Already Verified")) {
                    console.log("SubwalletRegistry já está verificado");
                } else {
                    console.error("Erro ao verificar SubwalletRegistry:", error);
                }
            }
        }

        // Verifica ACMEToken
        if (contracts.ACMEToken) {
            console.log("\nVerificando ACMEToken...");
            try {
                await run("verify:verify", {
                    address: contracts.ACMEToken,
                    constructorArguments: [deployer, contracts.SubwalletRegistry]
                });
                console.log("ACMEToken verificado com sucesso!");
            } catch (error: any) {
                if (error.message.includes("Already Verified")) {
                    console.log("ACMEToken já está verificado");
                } else {
                    console.error("Erro ao verificar ACMEToken:", error);
                }
            }
        }

        // Verifica ZKProofRegistry
        if (contracts.ZKProofRegistry) {
            console.log("\nVerificando ZKProofRegistry...");
            try {
                await run("verify:verify", {
                    address: contracts.ZKProofRegistry,
                    constructorArguments: [
                        contracts.ACMEToken,
                        contracts.SubwalletRegistry,
                        deployer
                    ]
                });
                console.log("ZKProofRegistry verificado com sucesso!");
            } catch (error: any) {
                if (error.message.includes("Already Verified")) {
                    console.log("ZKProofRegistry já está verificado");
                } else {
                    console.error("Erro ao verificar ZKProofRegistry:", error);
                }
            }
        }

        console.log("\nVerificação dos contratos concluída!");

    } catch (error) {
        console.error("Erro durante a verificação:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 