import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ProofRegistry", function () {
  let proofRegistry: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    // Obtém as contas de teste
    [owner, addr1] = await ethers.getSigners();

    // Implanta o contrato
    const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
    proofRegistry = await ProofRegistry.deploy();
    await proofRegistry.deployed();
  });

  describe("Registro de Prova", function () {
    it("Deve registrar uma nova prova corretamente", async function () {
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const requestedAmount = ethers.utils.parseEther("1.0");
      const netWorth = ethers.utils.parseEther("10.0");
      const isApproved = true;

      await expect(
        proofRegistry.registerProof(
          proofHash,
          requestedAmount,
          netWorth,
          isApproved,
          addr1.address
        )
      )
        .to.emit(proofRegistry, "ProofRegistered")
        .withArgs(
          proofHash,
          addr1.address,
          ethers.BigNumber.from(await ethers.provider.getBlockNumber()),
          requestedAmount,
          netWorth,
          isApproved
        );

      // Verifica se a prova foi registrada
      const exists = await proofRegistry.verifyProof(proofHash);
      expect(exists).to.be.true;

      // Obtém os detalhes da prova
      const details = await proofRegistry.getProofDetails(proofHash);
      expect(details.requestedAmount).to.equal(requestedAmount);
      expect(details.netWorth).to.equal(netWorth);
      expect(details.isApproved).to.equal(isApproved);
      expect(details.walletAddress).to.equal(addr1.address);
    });

    it("Não deve permitir registro duplicado", async function () {
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const requestedAmount = ethers.utils.parseEther("1.0");
      const netWorth = ethers.utils.parseEther("10.0");
      const isApproved = true;

      // Registra a prova pela primeira vez
      await proofRegistry.registerProof(
        proofHash,
        requestedAmount,
        netWorth,
        isApproved,
        addr1.address
      );

      // Tenta registrar a mesma prova novamente
      await expect(
        proofRegistry.registerProof(
          proofHash,
          requestedAmount,
          netWorth,
          isApproved,
          addr1.address
        )
      ).to.be.revertedWith("Proof already registered");
    });

    it("Deve retornar false para prova não existente", async function () {
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("nonexistent"));
      const exists = await proofRegistry.verifyProof(proofHash);
      expect(exists).to.be.false;
    });

    it("Deve reverter ao tentar obter detalhes de prova não existente", async function () {
      const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("nonexistent"));
      await expect(proofRegistry.getProofDetails(proofHash)).to.be.revertedWith(
        "Proof does not exist"
      );
    });
  });
}); 