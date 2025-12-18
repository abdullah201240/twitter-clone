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
  ) { }

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
    @Req() request: Request,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    const user = request.user as any;
    const userId = user ? user.userId : undefined;
    return await this.murmurService.getGlobalTimeline(limit, cursor, userId);
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
    @Req() request: Request,
    @Param('userId') userId: string,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    const user = request.user as any;
    const currentUserId = user ? user.userId : undefined;
    return await this.murmurService.getUserMurmurs(userId, limit, cursor, currentUserId);
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
  // NOTE: getMultipleLikeStatus must come BEFORE getLikeStatus to prevent route matching issues
  // /murmurs/like-status (no params) must be matched before /murmurs/:murmurId/like-status (with param)
  @Get('/murmurs/like-status')
  @UseGuards(JwtAuthGuard)
  async getMultipleLikeStatus(
    @Req() request: Request,
    @Query('ids') murmurIds: string[],
  ) {
    const user = request.user as any;

    // Validate input
    if (!murmurIds || !Array.isArray(murmurIds) || murmurIds.length === 0) {
      return {};
    }

    // Limit the number of IDs to prevent abuse
    if (murmurIds.length > 100) {
      murmurIds = murmurIds.slice(0, 100);
    }

    return await this.likeService.getMultipleLikeStatus(user.userId, murmurIds);
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

  @Post('/murmurs/:murmurId/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Req() request: Request,
    @Param('murmurId') murmurId: string,
  ) {
    const user = request.user as any;
    return await this.likeService.toggleLike(user.userId, murmurId);
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
    @Query('limit') limit: number = 10,
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