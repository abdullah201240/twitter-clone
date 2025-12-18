import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('murmurs')
@Index('idx_user_created', ['userId', 'createdAt'])
@Index('idx_created_at', ['createdAt'])
export class Murmur {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 0 })
  replyCount!: number;

  @Column({ default: 0 })
  repostCount!: number;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  mediaUrl!: string | null;

  @Column({ type: 'varchar', length: '36' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}