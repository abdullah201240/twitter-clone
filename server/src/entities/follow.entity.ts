import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique('unique_follower_following', ['followerId', 'followingId'])
@Index('idx_follower', ['followerId'])
@Index('idx_following', ['followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: '36' })
  followerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower!: User;

  @Column({ type: 'varchar', length: '36' })
  followingId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
