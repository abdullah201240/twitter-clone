import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeedTable1703000000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists, if not create it
        const table = await queryRunner.hasTable('feed');
        if (!table) {
            // Create table with raw SQL to ensure UTF-8MB4 charset
            await queryRunner.query(`
                CREATE TABLE \`feed\` (
                    \`id\` varchar(36) NOT NULL PRIMARY KEY,
                    \`userId\` varchar(36) NOT NULL,
                    \`murmurId\` varchar(36) NOT NULL,
                    \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT \`FK_feed_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
                    CONSTRAINT \`FK_feed_murmurId\` FOREIGN KEY (\`murmurId\`) REFERENCES \`murmurs\`(\`id\`) ON DELETE CASCADE,
                    INDEX \`idx_user_created\` (\`userId\`, \`createdAt\`),
                    INDEX \`idx_murmur_user\` (\`murmurId\`, \`userId\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
        } else {
            // Convert existing table to UTF-8MB4
            await queryRunner.query(`ALTER TABLE \`feed\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("feed", true);
    }
}
