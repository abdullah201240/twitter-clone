import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLikesTable1703000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`likes\` (
        \`id\` varchar(36) NOT NULL PRIMARY KEY,
        \`userId\` varchar(36) NOT NULL,
        \`murmurId\` varchar(36) NOT NULL,
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_user_murmur_like\` (\`userId\`, \`murmurId\`),
        INDEX \`idx_murmur_likes\` (\`murmurId\`),
        INDEX \`idx_user_likes\` (\`userId\`),
        CONSTRAINT \`FK_likes_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_likes_murmurId\` FOREIGN KEY (\`murmurId\`) REFERENCES \`murmurs\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('likes', true);
  }
}
