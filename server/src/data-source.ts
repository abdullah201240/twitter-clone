import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'docker',
    password: process.env.DB_PASSWORD || 'docker',
    database: process.env.DB_DATABASE || 'test',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: false,
    // Add connection pooling parameters
    extra: {
        connectionLimit: 20, // Adjust based on your server capacity
        queueLimit: 0,
    }
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
