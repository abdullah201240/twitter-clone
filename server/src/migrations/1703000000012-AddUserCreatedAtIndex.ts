import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddUserCreatedAtIndex1703000000012 implements MigrationInterface {
    name = 'AddUserCreatedAtIndex1703000000012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on user.createdAt for better query performance
        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_USERS_CREATED_AT',
            columnNames: ['createdAt']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.dropIndex('users', 'IDX_USERS_CREATED_AT');
    }
}