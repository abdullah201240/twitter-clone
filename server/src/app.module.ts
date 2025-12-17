import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'docker',
      password: process.env.DB_PASSWORD || 'docker',
      database: process.env.DB_DATABASE || 'test',
      entities: [User],
      migrations: ['dist/migrations/*.js'],
      migrationsTableName: 'migrations',
      migrationsRun: true, // Auto-run migrations on app start
      synchronize: false, // Disabled for production safety - use migrations instead
      logging: false,
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
