import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1703000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`comments\` (
        \`id\` varchar(36) NOT NULL PRIMARY KEY,
        \`content\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`murmurId\` varchar(36) NOT NULL,
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_murmur_comments\` (\`murmurId\`),
        INDEX \`idx_user_comments\` (\`userId\`),
        CONSTRAINT \`FK_comments_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_comments_murmurId\` FOREIGN KEY (\`murmurId\`) REFERENCES \`murmurs\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comments', true);
  }
}
