const { ethers } = require('hardhat');

async function main() {
    console.log('Deploying SolvencyVerifier contract...');

    // Get the contract factory
    const SolvencyVerifier = await ethers.getContractFactory('SolvencyVerifier');

    // Deploy the contract with the zkVerify address
    const zkVerifyAddress = process.env.ZKVERIFY_ADDRESS;
    const solvencyVerifier = await SolvencyVerifier.deploy(zkVerifyAddress);

    await solvencyVerifier.deployed();

    console.log('SolvencyVerifier deployed to:', solvencyVerifier.address);

    // Verify the contract on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
        console.log('Verifying contract on Etherscan...');
        await hre.run('verify:verify', {
            address: solvencyVerifier.address,
            constructorArguments: [zkVerifyAddress],
        });
        console.log('Contract verified on Etherscan');
    }

    return solvencyVerifier;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 