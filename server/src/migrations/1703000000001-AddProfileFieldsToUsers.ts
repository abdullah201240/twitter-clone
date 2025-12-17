import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileFieldsToUsers1703000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'coverImage',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'bio',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'location',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'website',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'followersCount',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'followingCount',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    // Modify avatar column to be larger
    await queryRunner.changeColumn(
      'users',
      'avatar',
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'coverImage');
    await queryRunner.dropColumn('users', 'bio');
    await queryRunner.dropColumn('users', 'location');
    await queryRunner.dropColumn('users', 'website');
    await queryRunner.dropColumn('users', 'followersCount');
    await queryRunner.dropColumn('users', 'followingCount');

    await queryRunner.changeColumn(
      'users',
      'avatar',
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }
}
