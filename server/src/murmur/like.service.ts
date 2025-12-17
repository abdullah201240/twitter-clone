import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      
      // Update murmur like count
      const murmur = await this.murmurRepository.findOne({ where: { id: murmurId } });
      if (murmur) {
        murmur.likeCount = Math.max(0, murmur.likeCount - 1);
        await this.murmurRepository.save(murmur);
      }
      
      return { liked: false, likeCount: murmur?.likeCount || 0 };
    } else {
      // Like
      const newLike = this.likeRepository.create({
        userId,
        murmurId,
      });
      await this.likeRepository.save(newLike);
      
      // Update murmur like count
      const murmur = await this.murmurRepository.findOne({ where: { id: murmurId } });
      if (murmur) {
        murmur.likeCount += 1;
        await this.murmurRepository.save(murmur);
      }
      
      return { liked: true, likeCount: murmur?.likeCount || 1 };
    }
  }

  async isLiked(userId: string, murmurId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });
    return !!like;
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
