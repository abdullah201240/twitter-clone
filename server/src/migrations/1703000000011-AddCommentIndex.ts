import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddCommentIndex1703000000011 implements MigrationInterface {
    name = 'AddCommentIndex1703000000011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add composite index on comment.murmurId and comment.createdAt for better query performance
        await queryRunner.createIndex('comments', new TableIndex({
            name: 'IDX_COMMENTS_MURMUR_CREATED',
            columnNames: ['murmurId', 'createdAt']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the composite index
        await queryRunner.dropIndex('comments', 'IDX_COMMENTS_MURMUR_CREATED');
    }
}