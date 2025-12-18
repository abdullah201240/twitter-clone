import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class OptimizeMurmurTableIndexes1703000000014 implements MigrationInterface {
    name = 'OptimizeMurmurTableIndexes1703000000014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on murmur.id + createdAt for better join performance
        await queryRunner.createIndex('murmurs', new TableIndex({
            name: 'idx_murmur_id_created',
            columnNames: ['id', 'createdAt']
        }));

        // Add index on userId + likeCount for better filtering performance
        await queryRunner.createIndex('murmurs', new TableIndex({
            name: 'idx_user_like_count',
            columnNames: ['userId', 'likeCount']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the indexes
        await queryRunner.dropIndex('murmurs', 'idx_murmur_id_created');
        await queryRunner.dropIndex('murmurs', 'idx_user_like_count');
    }
}