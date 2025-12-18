import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class OptimizeForLargeDataset1703000000015 implements MigrationInterface {
    name = 'OptimizeForLargeDataset1703000000015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on murmur.userId for user-specific queries
        await queryRunner.createIndex('murmurs', new TableIndex({
            name: 'idx_murmur_user_id',
            columnNames: ['userId']
        }));

        // Add index on feed.userId + feed.murmurId for faster joins
        await queryRunner.createIndex('feed', new TableIndex({
            name: 'idx_feed_user_murmur',
            columnNames: ['userId', 'murmurId']
        }));

        // Add index on murmur.id for faster lookups
        await queryRunner.createIndex('murmurs', new TableIndex({
            name: 'idx_murmur_id',
            columnNames: ['id']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the indexes in reverse order
        await queryRunner.dropIndex('murmurs', 'idx_murmur_id');
        await queryRunner.dropIndex('feed', 'idx_feed_user_murmur');
        await queryRunner.dropIndex('murmurs', 'idx_murmur_user_id');
    }
}