import { config } from '../config/config';
import { pool } from '../config/database';
import { User, BlockchainVerification, ZkpProof } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Serviço de usuários
export const userService = {
  async create(walletAddress: string): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      walletAddress,
      createdAt: now,
      updatedAt: now
    };

    await pool.query(
      'INSERT INTO users (id, wallet_address, created_at, updated_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.walletAddress, user.createdAt, user.updatedAt]
    );

    return user;
  },

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      walletAddress: result.rows[0].wallet_address,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  },

  async update(id: string, walletAddress: string): Promise<User | null> {
    const now = new Date();
    const result = await pool.query(
      'UPDATE users SET wallet_address = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [walletAddress, now, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      walletAddress: result.rows[0].wallet_address,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }
};

// Serviço de verificação blockchain
export const blockchainService = {
  async verifyAssets(transactionHash: string): Promise<BlockchainVerification> {
    const verification: BlockchainVerification = {
      id: uuidv4(),
      transactionHash,
      verified: true, // Mock: sempre retorna verificado
      timestamp: new Date(),
      createdAt: new Date()
    };

    await pool.query(
      'INSERT INTO blockchain_verifications (id, transaction_hash, verified, timestamp, created_at) VALUES ($1, $2, $3, $4, $5)',
      [verification.id, verification.transactionHash, verification.verified, verification.timestamp, verification.createdAt]
    );

    return verification;
  },

  async verifyTransaction(transactionHash: string): Promise<BlockchainVerification | null> {
    const result = await pool.query(
      'SELECT * FROM blockchain_verifications WHERE transaction_hash = $1',
      [transactionHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      transactionHash: result.rows[0].transaction_hash,
      verified: result.rows[0].verified,
      timestamp: result.rows[0].timestamp,
      createdAt: result.rows[0].created_at
    };
  }
};

// Serviço de provas ZKP
export const zkpService = {
  async generateProof(publicInputs: string[]): Promise<ZkpProof> {
    const proof: ZkpProof = {
      id: uuidv4(),
      proof: 'mock_proof', // Mock: prova simulada
      publicInputs,
      verificationKey: 'mock_key', // Mock: chave simulada
      createdAt: new Date()
    };

    await pool.query(
      'INSERT INTO zkp_proofs (id, proof, public_inputs, verification_key, created_at) VALUES ($1, $2, $3, $4, $5)',
      [proof.id, proof.proof, JSON.stringify(proof.publicInputs), proof.verificationKey, proof.createdAt]
    );

    return proof;
  },

  async verifyProof(proofId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT * FROM zkp_proofs WHERE id = $1',
      [proofId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Mock: sempre retorna verificado
    return true;
  }
}; 