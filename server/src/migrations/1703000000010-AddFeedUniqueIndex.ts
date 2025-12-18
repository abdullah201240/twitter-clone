import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddFeedUniqueIndex1703000000010 implements MigrationInterface {
    name = 'AddFeedUniqueIndex1703000000010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add unique composite index on feed.userId and feed.murmurId
        await queryRunner.createIndex('feed', new TableIndex({
            name: 'unique_user_murmur_feed',
            columnNames: ['userId', 'murmurId'],
            isUnique: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique index
        await queryRunner.dropIndex('feed', 'unique_user_murmur_feed');
    }
}