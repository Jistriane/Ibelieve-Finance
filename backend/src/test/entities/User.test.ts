import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import * as bcrypt from 'bcryptjs';

describe('User Entity', () => {
  let userRepository: any;

  beforeAll(async () => {
    userRepository = AppDataSource.getRepository(User);
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
      walletAddress: '0x1234567890abcdef'
    };

    const user = userRepository.create(userData);
    await userRepository.save(user);

    const savedUser = await userRepository.findOne({ where: { email: userData.email } });
    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.walletAddress).toBe(userData.walletAddress);
    expect(await bcrypt.compare('password123', savedUser.password)).toBe(true);
  });

  it('should not create user with duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
      walletAddress: '0x0987654321fedcba'
    };

    await userRepository.create(userData);
    await userRepository.save(userData);

    await expect(async () => {
      const duplicateUser = userRepository.create(userData);
      await userRepository.save(duplicateUser);
    }).rejects.toThrow();
  });

  it('should not create user with duplicate wallet address', async () => {
    const userData1 = {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
      walletAddress: '0xduplicatewallet'
    };

    const userData2 = {
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
      walletAddress: '0xduplicatewallet'
    };

    await userRepository.create(userData1);
    await userRepository.save(userData1);

    await expect(async () => {
      const duplicateUser = userRepository.create(userData2);
      await userRepository.save(duplicateUser);
    }).rejects.toThrow();
  });
}); 