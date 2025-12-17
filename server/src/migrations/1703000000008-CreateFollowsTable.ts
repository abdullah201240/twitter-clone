import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowsTable1703000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`follows\` (
        \`id\` varchar(36) NOT NULL PRIMARY KEY,
        \`followerId\` varchar(36) NOT NULL,
        \`followingId\` varchar(36) NOT NULL,
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_follower_following\` (\`followerId\`, \`followingId\`),
        INDEX \`idx_follower\` (\`followerId\`),
        INDEX \`idx_following\` (\`followingId\`),
        CONSTRAINT \`FK_follows_followerId\` FOREIGN KEY (\`followerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_follows_followingId\` FOREIGN KEY (\`followingId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('follows', true);
  }
}
