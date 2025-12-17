import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MurmurService } from './murmur.service';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';

@Controller('api')
export class MurmurController {
  constructor(
    private readonly murmurService: MurmurService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('/me/murmurs')
  @UseGuards(JwtAuthGuard)
  async createMurmur(
    @Req() request: Request,
    @Body('content') content: string,
    @Body('mediaUrl') mediaUrl?: string,
  ) {
    const user = request.user as any;
    return await this.murmurService.createMurmur(user.userId, content, mediaUrl);
  }

  @Get('/murmurs')
  async getTimeline(
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    return await this.murmurService.getGlobalTimeline(limit, cursor);
  }

  @Delete('/me/murmurs/:id')
  @UseGuards(JwtAuthGuard)
  async deleteMurmur(
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    const user = request.user as any;
    return await this.murmurService.deleteMurmur(id, user.userId);
  }

  @Get('/feed')
  @UseGuards(JwtAuthGuard)
  async getUserFeed(
    @Req() request: Request,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    const user = request.user as any;
    return await this.murmurService.getTimeline(user.userId, limit, cursor);
  }

  @Get('/users/:userId/murmurs')
  async getUserMurmurs(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    return await this.murmurService.getUserMurmurs(userId, limit, cursor);
  }

  @Post('/murmurs/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads',
  }))
  async uploadMurmurImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }
    const fileUrl = this.uploadService.getFileUrl(file.filename);
    return {
      filename: file.filename,
      url: fileUrl,
      size: file.size,
    };
  }

  // Like endpoints
  @Post('/murmurs/:murmurId/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Req() request: Request,
    @Param('murmurId') murmurId: string,
  ) {
    const user = request.user as any;
    return await this.likeService.toggleLike(user.userId, murmurId);
  }

  @Get('/murmurs/:murmurId/like-status')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Req() request: Request,
    @Param('murmurId') murmurId: string,
  ) {
    const user = request.user as any;
    const isLiked = await this.likeService.isLiked(user.userId, murmurId);
    return { isLiked };
  }

  // Comment endpoints
  @Post('/murmurs/:murmurId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Req() request: Request,
    @Param('murmurId') murmurId: string,
    @Body('content') content: string,
  ) {
    const user = request.user as any;
    return await this.commentService.createComment(user.userId, murmurId, content);
  }

  @Get('/murmurs/:murmurId/comments')
  async getComments(
    @Param('murmurId') murmurId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return await this.commentService.getCommentsByMurmur(murmurId, limit, offset);
  }

  @Delete('/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Req() request: Request,
    @Param('commentId') commentId: string,
  ) {
    const user = request.user as any;
    return await this.commentService.deleteComment(commentId, user.userId);
  }
}