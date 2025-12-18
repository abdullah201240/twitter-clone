import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddAdditionalIndexes1703000000009 implements MigrationInterface {
    name = 'AddAdditionalIndexes1703000000009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on murmur.createdAt for global timeline queries
        await queryRunner.createIndex('murmurs', new TableIndex({
            name: 'idx_created_at',
            columnNames: ['createdAt']
        }));

        // Add composite index on like.userId and like.murmurId for faster lookups
        await queryRunner.createIndex('likes', new TableIndex({
            name: 'idx_user_murmur',
            columnNames: ['userId', 'murmurId']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the indexes in reverse order
        await queryRunner.dropIndex('likes', 'idx_user_murmur');
        await queryRunner.dropIndex('murmurs', 'idx_created_at');
    }
}