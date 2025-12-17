import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Feed } from '../entities/feed.entity';
import { Like } from '../entities/like.entity';
import { Comment } from '../entities/comment.entity';
import { MurmurService } from './murmur.service';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { MurmurController } from './murmur.controller';
import { UploadService } from '../upload/upload.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Murmur, Feed, Like, Comment]), SearchModule],
  controllers: [MurmurController],
  providers: [MurmurService, LikeService, CommentService, UploadService],
  exports: [MurmurService, LikeService, CommentService],
})
export class MurmurModule {}