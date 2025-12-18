import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  Query,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { FollowService } from './follow.service';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly followService: FollowService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('/:userId')
  async getProfile(@Param('userId') userId: string) {
    return await this.profileService.getUserProfile(userId);
  }

  @Put('/update')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() request: Request, @Body() updateData: UpdateProfileDto) {
    const user = request.user as any;
    
    // Log the user info for debugging
    this.logger.log(`Update profile request from user ID: ${user?.userId}`);
    
    if (!user || !user.userId) {
      this.logger.warn('Update profile failed: No authenticated user found');
      throw new UnauthorizedException('Authentication required');
    }
    
    return await this.profileService.updateProfile(user.userId, updateData);
  }

  @Post('/upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', new UploadService().getMulterOptions() as any))
  async uploadAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const user = request.user as any;
    
    // Log the user info for debugging
    this.logger.log(`Upload avatar request from user ID: ${user?.userId}`);
    
    if (!user || !user.userId) {
      this.logger.warn('Upload avatar failed: No authenticated user found');
      throw new UnauthorizedException('Authentication required');
    }
    
    return await this.profileService.uploadAvatar(user.userId, file);
  }

  @Post('/upload-cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover', new UploadService().getMulterOptions() as any))
  async uploadCover(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const user = request.user as any;
    
    // Log the user info for debugging
    this.logger.log(`Upload cover request from user ID: ${user?.userId}`);
    
    if (!user || !user.userId) {
      this.logger.warn('Upload cover failed: No authenticated user found');
      throw new UnauthorizedException('Authentication required');
    }
    
    return await this.profileService.uploadCoverImage(user.userId, file);
  }

  // Follow endpoints
  @Post('/:userId/follow')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(
    @Req() request: Request,
    @Param('userId') userId: string,
  ) {
    const user = request.user as any;
    
    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    
    return await this.followService.toggleFollow(user.userId, userId);
  }

  @Get('/:userId/follow-status')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(
    @Req() request: Request,
    @Param('userId') userId: string,
  ) {
    const user = request.user as any;
    
    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    
    const isFollowing = await this.followService.isFollowing(user.userId, userId);
    return { isFollowing };
  }

  @Get('/:userId/followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return await this.followService.getFollowers(userId, limit, offset);
  }

  @Get('/:userId/following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return await this.followService.getFollowing(userId, limit, offset);
  }

  @Get('/follow-status')
  @UseGuards(JwtAuthGuard)
  async getMultipleFollowStatus(
    @Req() request: Request,
    @Query('ids') userIds: string[],
  ) {
    const user = request.user as any;
    
    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    
    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return {};
    }
    
    // Limit the number of IDs to prevent abuse
    if (userIds.length > 100) {
      userIds = userIds.slice(0, 100);
    }
    
    return await this.followService.getMultipleFollowStatus(user.userId, userIds);
  }
}