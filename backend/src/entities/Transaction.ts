import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['INCOME', 'EXPENSE', 'TRANSFER']
  })
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column('timestamp with time zone')
  date: Date;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  riskScore?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 