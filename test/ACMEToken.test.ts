import { expect } from "chai";
import { ethers } from "hardhat";
import { ACMEToken, SubwalletRegistry, ZKProofRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ACMEToken", function () {
    let acmeToken: ACMEToken;
    let subwalletRegistry: SubwalletRegistry;
    let zkProofRegistry: ZKProofRegistry;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let subwallet1: SignerWithAddress;
    let subwallet2: SignerWithAddress;

    const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 1 milhão de tokens

    beforeEach(async function () {
        // Obter signers para teste
        [owner, user1, user2, subwallet1, subwallet2] = await ethers.getSigners();

        // Deploy do SubwalletRegistry
        const SubwalletRegistry = await ethers.getContractFactory("SubwalletRegistry");
        subwalletRegistry = await SubwalletRegistry.deploy(owner.address);
        await subwalletRegistry.deployed();

        // Deploy do ACMEToken
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

        // Registrar algumas subwallets para teste
        await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
        await subwalletRegistry.connect(user2).registerSubwallet(subwallet2.address, "Subwallet 2");
    });

    describe("Inicialização", function () {
        it("Deve ter o supply inicial correto", async function () {
            expect(await acmeToken.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("Deve atribuir o supply inicial ao owner", async function () {
            expect(await acmeToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });

        it("Deve definir o nome e símbolo corretamente", async function () {
            expect(await acmeToken.name()).to.equal("ACME Token");
            expect(await acmeToken.symbol()).to.equal("ACME");
        });

        it("Deve configurar o SubwalletRegistry corretamente", async function () {
            expect(await acmeToken.subwalletRegistry()).to.equal(subwalletRegistry.address);
        });

        it("Deve configurar o ZKProofRegistry corretamente", async function () {
            expect(await acmeToken.zkProofRegistry()).to.equal(zkProofRegistry.address);
        });
    });

    describe("Operações com Tokens", function () {
        beforeEach(async function () {
            // Transferir alguns tokens para as subwallets
            await acmeToken.connect(owner).transfer(subwallet1.address, ethers.utils.parseEther("100"));
            await acmeToken.connect(owner).transfer(subwallet2.address, ethers.utils.parseEther("100"));
        });

        it("Deve atualizar última atividade ao transferir de uma subwallet", async function () {
            const beforeActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            await ethers.provider.send("evm_increaseTime", [3600]); // Avança 1 hora
            
            await acmeToken.connect(subwallet1).transfer(user1.address, ethers.utils.parseEther("10"));
            
            const afterActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            expect(afterActivity).to.be.gt(beforeActivity);
        });

        it("Deve permitir que subwallets queimem tokens", async function () {
            const amount = ethers.utils.parseEther("10");
            const initialBalance = await acmeToken.balanceOf(subwallet1.address);
            
            await acmeToken.connect(subwallet1).burn(amount);
            
            expect(await acmeToken.balanceOf(subwallet1.address)).to.equal(initialBalance.sub(amount));
        });

        it("Deve permitir que owner queime tokens", async function () {
            const amount = ethers.utils.parseEther("10");
            const initialBalance = await acmeToken.balanceOf(owner.address);
            
            await acmeToken.connect(owner).burn(amount);
            
            expect(await acmeToken.balanceOf(owner.address)).to.be.lt(INITIAL_SUPPLY);
        });

        it("Não deve permitir que endereços não autorizados queimem tokens", async function () {
            const amount = ethers.utils.parseEther("10");
            await expect(
                acmeToken.connect(user1).burn(amount)
            ).to.be.revertedWith("Apenas subwallets, owner ou ZKProofRegistry");
        });

        it("Deve permitir que owner minte novos tokens", async function () {
            const amount = ethers.utils.parseEther("1000");
            const initialSupply = await acmeToken.totalSupply();
            
            await acmeToken.connect(owner).mint(user1.address, amount);
            
            expect(await acmeToken.totalSupply()).to.equal(initialSupply.add(amount));
            expect(await acmeToken.balanceOf(user1.address)).to.equal(amount);
        });

        it("Não deve permitir que não-owners mintem tokens", async function () {
            const amount = ethers.utils.parseEther("1000");
            await expect(
                acmeToken.connect(user1).mint(user1.address, amount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Controle de Pausa", function () {
        it("Deve permitir que owner pause o contrato", async function () {
            await acmeToken.connect(owner).pause();
            expect(await acmeToken.paused()).to.be.true;
        });

        it("Deve impedir transferências quando pausado", async function () {
            await acmeToken.connect(owner).pause();
            await expect(
                acmeToken.connect(owner).transfer(user1.address, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Deve permitir que owner despause o contrato", async function () {
            await acmeToken.connect(owner).pause();
            await acmeToken.connect(owner).unpause();
            expect(await acmeToken.paused()).to.be.false;
        });

        it("Não deve permitir que não-owners pausem o contrato", async function () {
            await expect(
                acmeToken.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Integração com SubwalletRegistry", function () {
        it("Deve respeitar o status de atividade da subwallet", async function () {
            // Desativar subwallet1
            await subwalletRegistry.connect(user1).setSubwalletStatus(subwallet1.address, false);
            
            // Tentar queimar tokens com subwallet desativada
            await expect(
                acmeToken.connect(subwallet1).burn(ethers.utils.parseEther("10"))
            ).to.be.revertedWith("Apenas subwallets, owner ou ZKProofRegistry");
        });

        it("Deve atualizar atividade apenas para subwallets válidas", async function () {
            const amount = ethers.utils.parseEther("10");
            await acmeToken.connect(owner).transfer(user1.address, amount);
            
            // Transferência de usuário normal não deve atualizar atividade
            await acmeToken.connect(user1).transfer(user2.address, amount);
            
            // Transferência de subwallet deve atualizar atividade
            const beforeActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            await ethers.provider.send("evm_increaseTime", [3600]); // Avança 1 hora
            await acmeToken.connect(owner).transfer(subwallet1.address, amount);
            await acmeToken.connect(subwallet1).transfer(user1.address, amount);
            const afterActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            
            expect(afterActivity).to.be.gt(beforeActivity);
        });
    });
}); 