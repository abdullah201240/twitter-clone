import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { User } from '../entities/user.entity';

export interface UserWithFollowStatus {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
}

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async toggleFollow(followerId: string, followingId: string): Promise<{ isFollowing: boolean }> {
    // Check if already following
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      // Unfollow
      await this.followRepository.remove(existingFollow);
      
      // Update counts
      const follower = await this.userRepository.findOne({ where: { id: followerId } });
      const following = await this.userRepository.findOne({ where: { id: followingId } });
      
      if (follower) {
        follower.followingCount = Math.max(0, follower.followingCount - 1);
        await this.userRepository.save(follower);
      }
      
      if (following) {
        following.followersCount = Math.max(0, following.followersCount - 1);
        await this.userRepository.save(following);
      }
      
      return { isFollowing: false };
    } else {
      // Follow
      const newFollow = this.followRepository.create({
        followerId,
        followingId,
      });
      await this.followRepository.save(newFollow);
      
      // Update counts
      const follower = await this.userRepository.findOne({ where: { id: followerId } });
      const following = await this.userRepository.findOne({ where: { id: followingId } });
      
      if (follower) {
        follower.followingCount += 1;
        await this.userRepository.save(follower);
      }
      
      if (following) {
        following.followersCount += 1;
        await this.userRepository.save(following);
      }
      
      return { isFollowing: true };
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async getFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<UserWithFollowStatus[]> {
    const followers = await this.followRepository
      .createQueryBuilder('follow')
      .innerJoinAndSelect('follow.follower', 'follower')
      .where('follow.followingId = :userId', { userId })
      .orderBy('follow.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    return followers.map(f => ({
      id: f.follower.id,
      name: f.follower.name,
      username: f.follower.username,
      avatar: f.follower.avatar,
      bio: f.follower.bio,
      followersCount: f.follower.followersCount,
      followingCount: f.follower.followingCount,
      isFollowed: false, // Will be updated by controller if needed
    }));
  }

  async getFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<UserWithFollowStatus[]> {
    const following = await this.followRepository
      .createQueryBuilder('follow')
      .innerJoinAndSelect('follow.following', 'following')
      .where('follow.followerId = :userId', { userId })
      .orderBy('follow.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    return following.map(f => ({
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      avatar: f.following.avatar,
      bio: f.following.bio,
      followersCount: f.following.followersCount,
      followingCount: f.following.followingCount,
      isFollowed: false, // Will be updated by controller if needed
    }));
  }

  async getFollowerCount(userId: string): Promise<number> {
    return await this.followRepository.count({
      where: { followingId: userId },
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return await this.followRepository.count({
      where: { followerId: userId },
    });
  }

  async getMultipleFollowStatus(userId: string, targetUserIds: string[]): Promise<Record<string, boolean>> {
    try {
      if (!targetUserIds || targetUserIds.length === 0) {
        return {};
      }
      
      // Limit the number of IDs to prevent abuse
      if (targetUserIds.length > 100) {
        targetUserIds = targetUserIds.slice(0, 100);
      }
      
      // Fetch all follows for the given user and target user IDs in a single query
      const follows = await this.followRepository.find({
        where: {
          followerId: userId,
          followingId: In(targetUserIds),
        },
      });
      
      // Create a set of followed user IDs for fast lookup
      const followedUserIds = new Set(follows.map(follow => follow.followingId));
      
      // Build the result object
      const result: Record<string, boolean> = {};
      for (const targetUserId of targetUserIds) {
        result[targetUserId] = followedUserIds.has(targetUserId);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching multiple follow statuses:', error);
      return {};
    }
  }
}
