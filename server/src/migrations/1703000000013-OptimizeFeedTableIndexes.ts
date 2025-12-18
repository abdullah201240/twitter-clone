import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class OptimizeFeedTableIndexes1703000000013 implements MigrationInterface {
    name = 'OptimizeFeedTableIndexes1703000000013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on feed.createdAt for better sorting performance
        await queryRunner.createIndex('feed', new TableIndex({
            name: 'idx_feed_created_at',
            columnNames: ['createdAt']
        }));

        // Add composite index for better query performance on userId + createdAt + murmurId
        await queryRunner.createIndex('feed', new TableIndex({
            name: 'idx_feed_user_created_murmur',
            columnNames: ['userId', 'createdAt', 'murmurId']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the indexes
        await queryRunner.dropIndex('feed', 'idx_feed_created_at');
        await queryRunner.dropIndex('feed', 'idx_feed_user_created_murmur');
    }
}