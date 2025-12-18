import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Murmur } from '../entities/murmur.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
  ) {}

  async toggleLike(userId: string, murmurId: string): Promise<{ liked: boolean; likeCount: number }> {
    // Check if like exists
    const existingLike = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });

    if (existingLike) {
      // Unlike
      await this.likeRepository.remove(existingLike);
      
      // Update murmur like count using query builder for better performance
      await this.murmurRepository
        .createQueryBuilder()
        .update()
        .set({ likeCount: () => 'GREATEST(likeCount - 1, 0)' })
        .where('id = :murmurId', { murmurId })
        .execute();
      
      // Get updated like count
      const updatedMurmur = await this.murmurRepository.findOne({ 
        where: { id: murmurId },
        select: ['likeCount']
      });
      
      return { liked: false, likeCount: updatedMurmur?.likeCount || 0 };
    } else {
      // Like
      const newLike = this.likeRepository.create({
        userId,
        murmurId,
      });
      await this.likeRepository.save(newLike);
      
      // Update murmur like count using query builder for better performance
      await this.murmurRepository
        .createQueryBuilder()
        .update()
        .set({ likeCount: () => 'likeCount + 1' })
        .where('id = :murmurId', { murmurId })
        .execute();
      
      // Get updated like count
      const updatedMurmur = await this.murmurRepository.findOne({ 
        where: { id: murmurId },
        select: ['likeCount']
      });
      
      return { liked: true, likeCount: updatedMurmur?.likeCount || 1 };
    }
  }

  async isLiked(userId: string, murmurId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });
    return !!like;
  }

  async getMultipleLikeStatus(userId: string, murmurIds: string[]): Promise<Record<string, boolean>> {
    try {
      // Validate input
      if (!murmurIds || murmurIds.length === 0) {
        return {};
      }
      
      // Fetch all likes for the given user and murmur IDs in a single query
      const likes = await this.likeRepository.find({
        where: {
          userId,
          murmurId: In(murmurIds),
        },
      });
      
      // Create a set of liked murmur IDs for fast lookup
      const likedMurmurIds = new Set(likes.map(like => like.murmurId));
      
      // Build the result object
      const result: Record<string, boolean> = {};
      for (const murmurId of murmurIds) {
        result[murmurId] = likedMurmurIds.has(murmurId);
      }
      
      return result;
    } catch (error) {
      // Log error but don't fail the entire request
      console.error('Error fetching multiple like statuses:', error);
      return {};
    }
  }

  async getLikeCount(murmurId: string): Promise<number> {
    return await this.likeRepository.count({
      where: { murmurId },
    });
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return await this.likeRepository.find({
      where: { userId },
      relations: ['murmur'],
      order: { createdAt: 'DESC' },
    });
  }
}
