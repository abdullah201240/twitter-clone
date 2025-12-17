import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto, ProfileResponseDto } from './profile.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uploadService: UploadService,
  ) {}

  async getUserProfile(userId: string): Promise<ProfileResponseDto> {
    this.logger.log(`Fetching profile for user: ${userId}`);
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Profile not found for user: ${userId}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Successfully fetched profile for user: ${userId}`);
    return this.mapToProfileResponse(user);
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<ProfileResponseDto> {
    this.logger.log(`Updating profile for user: ${userId}`);
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Profile update failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    // Update allowed fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.location !== undefined) user.location = updateData.location;
    if (updateData.website !== undefined) user.website = updateData.website;

    await this.userRepository.save(user);
    this.logger.log(`Successfully updated profile for user: ${userId}`);
    return this.mapToProfileResponse(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<ProfileResponseDto> {
    this.logger.log(`Uploading avatar for user: ${userId}`);
    if (!file) {
      this.logger.warn(`Avatar upload failed: No file uploaded for user ${userId}`);
      throw new BadRequestException('No file uploaded');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Avatar upload failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldFilename = this.uploadService.extractFilenameFromUrl(user.avatar);
      if (oldFilename) {
        this.uploadService.deleteFile(oldFilename);
      }
    }

    // Set new avatar
    user.avatar = this.uploadService.getFileUrl(file.filename);
    await this.userRepository.save(user);

    this.logger.log(`Successfully uploaded avatar for user: ${userId}`);
    return this.mapToProfileResponse(user);
  }

  async uploadCoverImage(userId: string, file: Express.Multer.File): Promise<ProfileResponseDto> {
    this.logger.log(`Uploading cover image for user: ${userId}`);
    if (!file) {
      this.logger.warn(`Cover image upload failed: No file uploaded for user ${userId}`);
      throw new BadRequestException('No file uploaded');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Cover image upload failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    // Delete old cover image if exists
    if (user.coverImage) {
      const oldFilename = this.uploadService.extractFilenameFromUrl(user.coverImage);
      if (oldFilename) {
        this.uploadService.deleteFile(oldFilename);
      }
    }

    // Set new cover image
    user.coverImage = this.uploadService.getFileUrl(file.filename);
    await this.userRepository.save(user);

    this.logger.log(`Successfully uploaded cover image for user: ${userId}`);
    return this.mapToProfileResponse(user);
  }

  private mapToProfileResponse(user: User): ProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || null,
      location: user.location || null,
      website: user.website || null,
      avatar: user.avatar || null,
      coverImage: user.coverImage || null,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      createdAt: user.createdAt,
    };
  }
}
