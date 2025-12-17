import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMurmursTable1703000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "murmurs",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "content",
                    type: "text"
                },
                {
                    name: "likeCount",
                    type: "int",
                    default: 0
                },
                {
                    name: "replyCount",
                    type: "int",
                    default: 0
                },
                {
                    name: "repostCount",
                    type: "int",
                    default: 0
                },
                {
                    name: "mediaUrl",
                    type: "varchar",
                    length: "500",
                    isNullable: true
                },
                {
                    name: "userId",
                    type: "varchar",
                    length: "36"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Add foreign key constraint
        await queryRunner.createForeignKey("murmurs", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add indexes
        await queryRunner.query(`CREATE INDEX \`idx_user_created\` ON \`murmurs\` (\`userId\`, \`createdAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX \`idx_user_created\``);

        // Drop foreign key constraint
        const table = await queryRunner.getTable("murmurs");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("murmurs", foreignKey);
        }

        // Drop table
        await queryRunner.dropTable("murmurs");
    }
}