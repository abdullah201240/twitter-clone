import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Feed } from '../entities/feed.entity';
import { User } from '../entities/user.entity';

export interface TimelineResponse {
  data: Murmur[];
  nextCursor: string | null;
}

@Injectable()
export class MurmurService {
  constructor(
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
  ) {}

  async createMurmur(userId: string, content: string, mediaUrl?: string): Promise<Murmur> {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Content cannot be empty');
    }

    if (content.length > 280) {
      throw new BadRequestException('Content cannot exceed 280 characters');
    }

    const murmur = this.murmurRepository.create({
      content: content.trim(),
      userId,
      mediaUrl: mediaUrl || null,
    });

    const savedMurmur = await this.murmurRepository.save(murmur);
    

    // Fan-out on write: Add to creator's feed using query builder for better performance
    // Ignore duplicate key errors as the unique constraint will prevent duplicates
    try {
      await this.feedRepository
        .createQueryBuilder()
        .insert()
        .into('feed')
        .values({
          userId: userId,
          murmurId: savedMurmur.id,
        })
        .execute();
    } catch (error) {
      // Ignore duplicate key errors
      if (!error.message.includes('Duplicate entry') && !error.message.includes('UNIQUE constraint failed')) {
        throw error;
      }
    }

    return savedMurmur;
  }

  async getMurmurById(id: string): Promise<Murmur> {
    const murmur = await this.murmurRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!murmur) {
      throw new NotFoundException('Murmur not found');
    }

    return murmur;
  }

  async getUserMurmurs(userId: string, limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    // Optimized query with proper indexing and select optimization
    const query = this.murmurRepository
      .createQueryBuilder('murmur')
      .select([
        'murmur.id',
        'murmur.content',
        'murmur.likeCount',
        'murmur.replyCount',
        'murmur.repostCount',
        'murmur.mediaUrl',
        'murmur.userId',
        'murmur.createdAt',
        'murmur.updatedAt',
        'user.id',
        'user.name',
        'user.username',
        'user.avatar'
      ])
      .innerJoin('murmur.user', 'user')
      .where('murmur.userId = :userId', { userId })
      .orderBy('murmur.createdAt', 'DESC')
      .limit(limit + 1);

    // Apply cursor if provided
    if (cursor) {
      query.andWhere('murmur.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const results = await query.getMany();
    const hasMore = results.length > limit;
    const data = results.slice(0, limit);
    const nextCursor = hasMore ? results[limit - 1].createdAt.toISOString() : null;

    return {
      data,
      nextCursor,
    };
  }

  // Keep old method for backwards compatibility
  async getUserMurmursOld(userId: string, limit: number = 10, offset: number = 0): Promise<Murmur[]> {
    return await this.murmurRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });
  }

  async getTimeline(userId: string, limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    // Optimized query using feed repository with proper indexing
    const query = this.feedRepository
      .createQueryBuilder('feed')
      .select([
        'feed.id',
        'feed.userId',
        'feed.murmurId',
        'feed.createdAt',
        'murmur.id',
        'murmur.content',
        'murmur.likeCount',
        'murmur.replyCount',
        'murmur.repostCount',
        'murmur.mediaUrl',
        'murmur.userId',
        'murmur.createdAt',
        'murmur.updatedAt',
        'user.id',
        'user.name',
        'user.username',
        'user.avatar'
      ])
      .innerJoin('feed.murmur', 'murmur')
      .innerJoin('murmur.user', 'user')
      .where('feed.userId = :userId', { userId })
      .orderBy('feed.createdAt', 'DESC')
      .limit(limit + 1);

    // Apply cursor if provided
    if (cursor) {
      query.andWhere('feed.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const results = await query.getMany();
    const hasMore = results.length > limit;
    const data = results.slice(0, limit).map(feed => feed.murmur);
    const nextCursor = hasMore ? results[limit - 1].createdAt.toISOString() : null;

    return {
      data,
      nextCursor,
    };
  }

  async getGlobalTimeline(limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    // Build query for cursor-based pagination with optimized selects
    const query = this.murmurRepository
      .createQueryBuilder('murmur')
      .select([
        'murmur.id',
        'murmur.content',
        'murmur.likeCount',
        'murmur.replyCount',
        'murmur.repostCount',
        'murmur.mediaUrl',
        'murmur.userId',
        'murmur.createdAt',
        'murmur.updatedAt',
        'user.id',
        'user.name',
        'user.username',
        'user.avatar'
      ])
      .innerJoin('murmur.user', 'user')
      .orderBy('murmur.createdAt', 'DESC')
      .limit(limit + 1);

    // Apply cursor if provided
    if (cursor) {
      query.andWhere('murmur.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const results = await query.getMany();
    const hasMore = results.length > limit;
    const data = results.slice(0, limit);
    const nextCursor = hasMore ? results[limit - 1].createdAt.toISOString() : null;

    return {
      data,
      nextCursor,
    };
  }

  async deleteMurmur(id: string, userId: string): Promise<boolean> {
    const murmur = await this.murmurRepository.findOne({
      where: { id, userId },
    });

    if (!murmur) {
      throw new NotFoundException('Murmur not found or you do not have permission to delete it');
    }

    await this.murmurRepository.remove(murmur);
    return true;
  }

  async getMurmurCountByUser(userId: string): Promise<number> {
    return await this.murmurRepository.count({
      where: { userId },
    });
  }
}