import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity('comments')
@Index('idx_murmur_comments', ['murmurId'])
@Index('idx_user_comments', ['userId'])
@Index('idx_murmur_created', ['murmurId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  content!: string;

  @Column({ type: 'varchar', length: '36' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: '36' })
  murmurId!: string;

  @ManyToOne(() => Murmur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'murmurId' })
  murmur!: Murmur;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
