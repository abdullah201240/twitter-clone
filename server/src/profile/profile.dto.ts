import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  website?: string;
}

export class ProfileResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  coverImage: string | null;
  followersCount: number;
  followingCount: number;
  murmurCount: number;
  createdAt: Date;
}
