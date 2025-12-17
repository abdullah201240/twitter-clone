import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { MurmurModule } from '../murmur/murmur.module';
import { SearchModule } from '../search/search.module';
import { ProfileService } from './profile.service';
import { FollowService } from './follow.service';
import { ProfileController } from './profile.controller';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow]), MurmurModule, SearchModule],
  providers: [ProfileService, FollowService, UploadService],
  controllers: [ProfileController],
  exports: [ProfileService, FollowService, UploadService],
})
export class ProfileModule {}
