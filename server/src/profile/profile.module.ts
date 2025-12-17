import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ProfileService, UploadService],
  controllers: [ProfileController],
  exports: [ProfileService, UploadService],
})
export class ProfileModule {}
