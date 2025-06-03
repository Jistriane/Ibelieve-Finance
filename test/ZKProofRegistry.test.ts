import { expect } from "chai";
import { ethers } from "hardhat";
import { ACMEToken, SubwalletRegistry, ZKProofRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ZKProofRegistry", function () {
    let acmeToken: ACMEToken;
    let subwalletRegistry: SubwalletRegistry;
    let zkProofRegistry: ZKProofRegistry;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let subwallet1: SignerWithAddress;
    let subwallet2: SignerWithAddress;

    const PROOF_REGISTRATION_COST = ethers.utils.parseEther("0.1"); // 0.1 ACME
    const INITIAL_TOKENS = ethers.utils.parseEther("1000"); // 1000 ACME

    beforeEach(async function () {
        [owner, user1, user2, subwallet1, subwallet2] = await ethers.getSigners();

        // Deploy SubwalletRegistry
        const SubwalletRegistry = await ethers.getContractFactory("SubwalletRegistry");
        subwalletRegistry = await SubwalletRegistry.deploy(owner.address);
        await subwalletRegistry.deployed();

        // Deploy ACMEToken
        const ACMEToken = await ethers.getContractFactory("ACMEToken");
        acmeToken = await ACMEToken.deploy(owner.address, subwalletRegistry.address);
        await acmeToken.deployed();

        // Deploy ZKProofRegistry
        const ZKProofRegistry = await ethers.getContractFactory("ZKProofRegistry");
        zkProofRegistry = await ZKProofRegistry.deploy(
            acmeToken.address,
            subwalletRegistry.address,
            owner.address
        );
        await zkProofRegistry.deployed();

        // Set ZKProofRegistry in ACMEToken
        await acmeToken.setZKProofRegistry(zkProofRegistry.address);

        // Register subwallets
        await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
        await subwalletRegistry.connect(user2).registerSubwallet(subwallet2.address, "Subwallet 2");

        // Transfer tokens to subwallets
        await acmeToken.connect(owner).transfer(subwallet1.address, INITIAL_TOKENS);
        await acmeToken.connect(owner).transfer(subwallet2.address, INITIAL_TOKENS);

        // Approve ZKProofRegistry to spend tokens
        await acmeToken.connect(subwallet1).approve(zkProofRegistry.address, ethers.constants.MaxUint256);
        await acmeToken.connect(subwallet2).approve(zkProofRegistry.address, ethers.constants.MaxUint256);
    });

    describe("Inicialização", function () {
        it("Deve configurar os endereços corretamente", async function () {
            expect(await zkProofRegistry.acmeToken()).to.equal(acmeToken.address);
            expect(await zkProofRegistry.subwalletRegistry()).to.equal(subwalletRegistry.address);
            expect(await zkProofRegistry.owner()).to.equal(owner.address);
        });

        it("Deve ter o custo inicial correto", async function () {
            expect(await zkProofRegistry.PROOF_REGISTRATION_COST()).to.equal(PROOF_REGISTRATION_COST);
        });
    });

    describe("Registro de Provas", function () {
        const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test proof"));

        it("Deve registrar uma nova prova", async function () {
            await zkProofRegistry.connect(subwallet1).submitProof(proofHash);
            const proof = await zkProofRegistry.getProof(proofHash);
            expect(proof.hash).to.equal(proofHash);
            expect(proof.submitter).to.equal(subwallet1.address);
            expect(proof.verified).to.be.false;
        });

        it("Deve queimar tokens ACME ao registrar prova", async function () {
            const initialBalance = await acmeToken.balanceOf(subwallet1.address);
            await zkProofRegistry.connect(subwallet1).submitProof(proofHash);
            const finalBalance = await acmeToken.balanceOf(subwallet1.address);
            expect(finalBalance).to.equal(initialBalance.sub(PROOF_REGISTRATION_COST));
        });

        it("Deve falhar se não houver tokens ACME suficientes", async function () {
            // Transferir todos os tokens para outro endereço
            await acmeToken.connect(subwallet1).transfer(owner.address, INITIAL_TOKENS);
            await expect(
                zkProofRegistry.connect(subwallet1).submitProof(proofHash)
            ).to.be.revertedWith("Saldo ACME insuficiente");
        });

        it("Deve falhar ao tentar registrar prova duplicada", async function () {
            await zkProofRegistry.connect(subwallet1).submitProof(proofHash);
            await expect(
                zkProofRegistry.connect(subwallet1).submitProof(proofHash)
            ).to.be.revertedWith("Proof already exists");
        });

        it("Deve aplicar desconto baseado na quantidade de provas", async function () {
            // Registrar 10 provas para obter desconto máximo
            for (let i = 0; i < 10; i++) {
                const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`proof ${i}`));
                await zkProofRegistry.connect(subwallet1).submitProof(hash);
            }

            const discountedCost = await zkProofRegistry.getDiscountedCost(subwallet1.address);
            const expectedCost = PROOF_REGISTRATION_COST.mul(70).div(100); // 30% de desconto
            expect(discountedCost).to.equal(expectedCost);
        });
    });

    describe("Recuperação de Emergência", function () {
        it("Não deve permitir recuperar tokens ACME", async function () {
            await expect(
                zkProofRegistry.connect(owner).emergencyTokenRecovery(acmeToken.address, ethers.utils.parseEther("1"))
            ).to.be.revertedWith("Nao pode recuperar token ACME");
        });

        it("Deve permitir recuperar outros tokens", async function () {
            // Simular outro token ERC20
            const TestToken = await ethers.getContractFactory("ACMEToken");
            const testToken = await TestToken.deploy(owner.address, subwalletRegistry.address);
            await testToken.deployed();

            // Enviar alguns tokens para o contrato
            const amount = ethers.utils.parseEther("1");
            await testToken.transfer(zkProofRegistry.address, amount);

            // Recuperar tokens
            await zkProofRegistry.connect(owner).emergencyTokenRecovery(testToken.address, amount);
            
            // Verificar o saldo após a recuperação
            const ownerBalance = await testToken.balanceOf(owner.address);
            const initialSupply = ethers.utils.parseEther("1000000");
            expect(ownerBalance).to.equal(initialSupply);
        });
    });
}); 