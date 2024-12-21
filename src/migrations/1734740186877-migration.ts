import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734740186877 implements MigrationInterface {
    name = 'Migration1734740186877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying NOT NULL DEFAULT 'Name'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emailAddress" character varying NOT NULL DEFAULT 'Email'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailAddress"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
    }

}
