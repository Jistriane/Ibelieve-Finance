import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: '.env-dev' });

// Configuração das chaves
const PRIVATE_KEY = process.env.PRIVATE_KEY || "87797c90c907ad1c5390d5d05ff658b5b41cc2d62eed8757e84a6b99b8512132";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "87797c90c907ad1c5390d5d05ff658b5b41cc2d62eed8757e84a6b99b8512132";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YFIKSIHHD5GHGBT19Y8BGSAGK3CFY72KC3";
const METAMASK_API_KEY = process.env.METAMASK_API_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

export default config; 