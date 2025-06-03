const { expect } = require('chai');
const { ethers } = require('ethers');
const axios = require('axios');
const SolvencyProof = require('../src/zkp/solvencyProof');
const RiskAnalysisAI = require('../src/ai/riskAnalysis');

describe('IBelieve Finance E2E Tests', () => {
    let solvencyProof;
    let riskAnalysis;
    let provider;
    let signer;

    before(async () => {
        // Connect to zkVerify testnet
        provider = new ethers.providers.JsonRpcProvider('https://volta-rpc.zkverify.io/');
        signer = provider.getSigner();
        solvencyProof = new SolvencyProof();
        riskAnalysis = new RiskAnalysisAI('http://localhost:11434/api/chat', true); // Usar mock
    });

    describe('Solvency Proof Generation', () => {
        it('should generate a valid solvency proof', async () => {
            const assets = ethers.utils.parseEther('1000');
            const liabilities = ethers.utils.parseEther('500');

            const result = await solvencyProof.generateProof(assets, liabilities);

            expect(result.success).to.be.true;
            expect(result.proof).to.exist;
            expect(result.publicInputs).to.exist;
        });

        it('should verify a generated proof', async () => {
            const assets = ethers.utils.parseEther('1000');
            const liabilities = ethers.utils.parseEther('500');

            const proofResult = await solvencyProof.generateProof(assets, liabilities);
            const verificationResult = await solvencyProof.verifyProof(
                proofResult.proof,
                proofResult.publicInputs
            );

            expect(verificationResult.success).to.be.true;
            expect(verificationResult.isValid).to.be.true;
        });

        it('should register proof on chain', async () => {
            const assets = ethers.utils.parseEther('1000');
            const liabilities = ethers.utils.parseEther('500');

            const proofResult = await solvencyProof.generateProof(assets, liabilities);
            const registrationResult = await solvencyProof.registerProofOnChain(
                proofResult.proof,
                proofResult.publicInputs
            );

            expect(registrationResult.success).to.be.true;
            expect(registrationResult.transactionHash).to.exist;
        });
    });

    describe('Risk Analysis', () => {
        it('should perform AI risk analysis', async () => {
            const data = {
                assets: '1000',
                liabilities: '500',
                transactions: [],
                marketConditions: {}
            };

            const result = await riskAnalysis.analyzeRisk(data);
            expect(result.success).to.be.true;
            expect(result.analysis).to.exist;
            expect(result.analysis.riskScore).to.be.a('number');
            expect(result.analysis.confidenceLevel).to.be.a('number');
            expect(result.analysis.riskFactors).to.be.an('array');
            expect(result.analysis.recommendations).to.be.an('array');
        });
    });

    describe('API Integration', () => {
        const API_URL = 'http://localhost:3000/api';

        async function isServiceAvailable(url) {
            try {
                await axios.get(url);
                return true;
            } catch (error) {
                return false;
            }
        }

        beforeEach(async function() {
            if (!(await isServiceAvailable(API_URL))) {
                console.log('Pulando testes de API - serviço offline');
                this.skip();
            }
        });

        it('should handle solvency proof generation via API', async () => {
            const response = await axios.post(`${API_URL}/solvency/generate`, {
                assets: '1000',
                liabilities: '500'
            });

            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
            expect(response.data.proof).to.exist;
        });

        it('should handle risk analysis via API', async () => {
            const response = await axios.post(`${API_URL}/risk/analyze`, {
                assets: '1000',
                liabilities: '500',
                transactions: [],
                marketConditions: {}
            });

            expect(response.status).to.equal(200);
            expect(response.data.success).to.be.true;
            expect(response.data.analysis).to.exist;
        });
    });
}); 