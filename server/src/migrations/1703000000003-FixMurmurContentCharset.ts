import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class FixMurmurContentCharset1703000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable("murmurs");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("murmurs", foreignKey);
        }

        // First, ensure users table is also utf8mb4
        await queryRunner.query(`ALTER TABLE \`users\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // Alter the murmurs table to use utf8mb4 charset
        await queryRunner.query(`ALTER TABLE \`murmurs\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // Specifically alter the content column to support emojis
        await queryRunner.query(`ALTER TABLE \`murmurs\` MODIFY COLUMN \`content\` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // Recreate foreign key
        await queryRunner.createForeignKey("murmurs", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable("murmurs");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("murmurs", foreignKey);
        }

        // Revert to utf8
        await queryRunner.query(`ALTER TABLE \`murmurs\` CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci`);

        // Revert content column
        await queryRunner.query(`ALTER TABLE \`murmurs\` MODIFY COLUMN \`content\` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci`);

        // Also revert users table
        await queryRunner.query(`ALTER TABLE \`users\` CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci`);

        // Recreate foreign key
        await queryRunner.createForeignKey("murmurs", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));
    }
}
