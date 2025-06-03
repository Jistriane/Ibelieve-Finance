import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1710000000000 implements MigrationInterface {
    name = 'CreateInitialTables1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de usuários
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL,
                "role" VARCHAR NOT NULL,
                "wallet_address" VARCHAR NOT NULL UNIQUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            )
        `);

        // Criar tabela de transações
        await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" UUID NOT NULL,
                "type" VARCHAR NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
                "amount" DECIMAL(10,2) NOT NULL,
                "description" VARCHAR NOT NULL,
                "category" VARCHAR NOT NULL,
                "date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" VARCHAR NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
                "risk_score" DECIMAL(3,2),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Criar tabela de análises
        await queryRunner.query(`
            CREATE TABLE "analyses" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "transaction_id" UUID NOT NULL,
                "user_id" UUID NOT NULL,
                "risk_score" DECIMAL(3,2) NOT NULL,
                "fraud_probability" DECIMAL(3,2) NOT NULL,
                "recommendations" TEXT[] NOT NULL,
                "indicators" TEXT[] NOT NULL,
                "analysis_details" JSONB NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Criar tabela de feedbacks
        await queryRunner.query(`
            CREATE TABLE "feedbacks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "analysis_id" UUID NOT NULL,
                "transaction_id" UUID NOT NULL,
                "user_id" UUID NOT NULL,
                "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                "comment" TEXT,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                FOREIGN KEY ("analysis_id") REFERENCES "analyses" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Criar índices
        await queryRunner.query(`CREATE INDEX "idx_transactions_user_id" ON "transactions" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_transactions_date" ON "transactions" ("date")`);
        await queryRunner.query(`CREATE INDEX "idx_analyses_transaction_id" ON "analyses" ("transaction_id")`);
        await queryRunner.query(`CREATE INDEX "idx_analyses_user_id" ON "analyses" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_feedbacks_analysis_id" ON "feedbacks" ("analysis_id")`);
        await queryRunner.query(`CREATE INDEX "idx_feedbacks_transaction_id" ON "feedbacks" ("transaction_id")`);
        await queryRunner.query(`CREATE INDEX "idx_feedbacks_user_id" ON "feedbacks" ("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices
        await queryRunner.query(`DROP INDEX "idx_feedbacks_user_id"`);
        await queryRunner.query(`DROP INDEX "idx_feedbacks_transaction_id"`);
        await queryRunner.query(`DROP INDEX "idx_feedbacks_analysis_id"`);
        await queryRunner.query(`DROP INDEX "idx_analyses_user_id"`);
        await queryRunner.query(`DROP INDEX "idx_analyses_transaction_id"`);
        await queryRunner.query(`DROP INDEX "idx_transactions_date"`);
        await queryRunner.query(`DROP INDEX "idx_transactions_user_id"`);

        // Remover tabelas
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TABLE "analyses"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
} 