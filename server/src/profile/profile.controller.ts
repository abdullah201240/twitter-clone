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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
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
    return await this.profileService.uploadCoverImage(user.userId, file);
  }
}
