import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Murmur } from '../entities/murmur.entity';

export interface CommentResponse {
  id: string;
  content: string;
  userId: string;
  murmurId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
}

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
  ) {}

  async createComment(userId: string, murmurId: string, content: string): Promise<CommentResponse> {
    // Check if murmur exists
    const murmur = await this.murmurRepository.findOne({ where: { id: murmurId } });
    if (!murmur) {
      throw new NotFoundException('Murmur not found');
    }

    // Create comment
    const comment = this.commentRepository.create({
      userId,
      murmurId,
      content,
    });
    const savedComment = await this.commentRepository.save(comment);

    // Update murmur reply count
    murmur.replyCount += 1;
    await this.murmurRepository.save(murmur);

    // Load user data
    const commentWithUser = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    return {
      id: commentWithUser!.id,
      content: commentWithUser!.content,
      userId: commentWithUser!.userId,
      murmurId: commentWithUser!.murmurId,
      createdAt: commentWithUser!.createdAt.toISOString(),
      user: {
        id: commentWithUser!.user.id,
        name: commentWithUser!.user.name,
        username: commentWithUser!.user.username,
        avatar: commentWithUser!.user.avatar,
      },
    };
  }

  async getCommentsByMurmur(murmurId: string, limit: number = 10, offset: number = 0): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.find({
      where: { murmurId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      murmurId: comment.murmurId,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        username: comment.user.username,
        avatar: comment.user.avatar,
      },
    }));
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['murmur'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You do not have permission to delete this comment');
    }

    // Update murmur reply count
    const murmur = comment.murmur;
    murmur.replyCount = Math.max(0, murmur.replyCount - 1);
    await this.murmurRepository.save(murmur);

    // Delete comment
    await this.commentRepository.remove(comment);
    return true;
  }

  async getCommentCount(murmurId: string): Promise<number> {
    return await this.commentRepository.count({
      where: { murmurId },
    });
  }
}
