import { expect } from "chai";
import { ethers } from "hardhat";
import { SubwalletRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SubwalletRegistry", function () {
    let subwalletRegistry: SubwalletRegistry;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let subwallet1: SignerWithAddress;
    let subwallet2: SignerWithAddress;

    beforeEach(async function () {
        // Obter signers para teste
        [owner, user1, user2, subwallet1, subwallet2] = await ethers.getSigners();

        // Deploy do contrato
        const SubwalletRegistry = await ethers.getContractFactory("SubwalletRegistry");
        subwalletRegistry = await SubwalletRegistry.deploy(owner.address);
        await subwalletRegistry.deployed();
    });

    describe("Inicialização", function () {
        it("Deve definir o owner corretamente", async function () {
            expect(await subwalletRegistry.owner()).to.equal(owner.address);
        });

        it("Deve iniciar não pausado", async function () {
            expect(await subwalletRegistry.paused()).to.equal(false);
        });
    });

    describe("Registro de Subwallets", function () {
        it("Deve registrar uma nova subwallet", async function () {
            await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
            
            const details = await subwalletRegistry.getSubwalletDetails(subwallet1.address);
            expect(details.name).to.equal("Subwallet 1");
            expect(details.isRegistered).to.equal(true);
            expect(details.isActive).to.equal(true);
            expect(details.owner).to.equal(user1.address);
        });

        it("Deve emitir evento ao registrar subwallet", async function () {
            await expect(subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1"))
                .to.emit(subwalletRegistry, "SubwalletRegistered")
                .withArgs(subwallet1.address, "Subwallet 1");
        });

        it("Deve falhar ao registrar subwallet já existente", async function () {
            await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
            await expect(
                subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1")
            ).to.be.revertedWith("Subwallet ja registrada");
        });

        it("Deve falhar ao registrar com endereço zero", async function () {
            await expect(
                subwalletRegistry.connect(user1).registerSubwallet(ethers.constants.AddressZero, "Subwallet 1")
            ).to.be.revertedWith("Endereco invalido");
        });

        it("Deve falhar ao registrar com nome vazio", async function () {
            await expect(
                subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "")
            ).to.be.revertedWith("Nome invalido");
        });

        it("Deve respeitar o limite de subwallets por owner", async function () {
            const signers = await ethers.getSigners();
            // Tenta registrar MAX_SUBWALLETS_PER_OWNER + 1 subwallets
            for (let i = 0; i < 10; i++) {
                await subwalletRegistry.connect(user1).registerSubwallet(signers[i + 4].address, `Subwallet ${i}`);
            }
            
            await expect(
                subwalletRegistry.connect(user1).registerSubwallet(signers[14].address, "Subwallet Extra")
            ).to.be.revertedWith("Limite de subwallets por owner atingido");
        });
    });

    describe("Gerenciamento de Subwallets", function () {
        beforeEach(async function () {
            await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
        });

        it("Deve atualizar nome da subwallet", async function () {
            await subwalletRegistry.connect(user1).updateSubwalletName(subwallet1.address, "Novo Nome");
            const details = await subwalletRegistry.getSubwalletDetails(subwallet1.address);
            expect(details.name).to.equal("Novo Nome");
        });

        it("Deve permitir que apenas owner ou admin atualize nome", async function () {
            await expect(
                subwalletRegistry.connect(user2).updateSubwalletName(subwallet1.address, "Novo Nome")
            ).to.be.revertedWith("Sem permissao");
        });

        it("Deve remover subwallet", async function () {
            await subwalletRegistry.connect(user1).removeSubwallet(subwallet1.address);
            const details = await subwalletRegistry.getSubwalletDetails(subwallet1.address);
            expect(details.isRegistered).to.equal(false);
        });

        it("Deve atualizar status da subwallet", async function () {
            await subwalletRegistry.connect(user1).setSubwalletStatus(subwallet1.address, false);
            const details = await subwalletRegistry.getSubwalletDetails(subwallet1.address);
            expect(details.isActive).to.equal(false);
        });

        it("Deve atualizar última atividade", async function () {
            const beforeActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            await ethers.provider.send("evm_increaseTime", [3600]); // Avança 1 hora
            await subwalletRegistry.updateLastActivity(subwallet1.address);
            const afterActivity = (await subwalletRegistry.getSubwalletDetails(subwallet1.address)).lastActivity;
            expect(afterActivity).to.be.gt(beforeActivity);
        });
    });

    describe("Consultas", function () {
        beforeEach(async function () {
            await subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1");
            await subwalletRegistry.connect(user2).registerSubwallet(subwallet2.address, "Subwallet 2");
        });

        it("Deve retornar lista de todas as subwallets", async function () {
            const subwallets = await subwalletRegistry.getAllSubwallets();
            expect(subwallets).to.have.lengthOf(2);
            expect(subwallets).to.include(subwallet1.address);
            expect(subwallets).to.include(subwallet2.address);
        });

        it("Deve retornar subwallets por owner", async function () {
            const user1Subwallets = await subwalletRegistry.getOwnerSubwallets(user1.address);
            expect(user1Subwallets).to.have.lengthOf(1);
            expect(user1Subwallets[0]).to.equal(subwallet1.address);
        });

        it("Deve validar subwallet corretamente", async function () {
            expect(await subwalletRegistry.isValidSubwallet(subwallet1.address)).to.be.true;
            await subwalletRegistry.connect(user1).setSubwalletStatus(subwallet1.address, false);
            expect(await subwalletRegistry.isValidSubwallet(subwallet1.address)).to.be.false;
        });
    });

    describe("Controle de Pausa", function () {
        it("Deve permitir que owner pause o contrato", async function () {
            await subwalletRegistry.connect(owner).pause();
            expect(await subwalletRegistry.paused()).to.be.true;
        });

        it("Deve impedir operações quando pausado", async function () {
            await subwalletRegistry.connect(owner).pause();
            await expect(
                subwalletRegistry.connect(user1).registerSubwallet(subwallet1.address, "Subwallet 1")
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Deve permitir que owner despause o contrato", async function () {
            await subwalletRegistry.connect(owner).pause();
            await subwalletRegistry.connect(owner).unpause();
            expect(await subwalletRegistry.paused()).to.be.false;
        });
    });
}); 