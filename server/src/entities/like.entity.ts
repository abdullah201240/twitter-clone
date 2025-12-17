import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity('likes')
@Unique('unique_user_murmur_like', ['userId', 'murmurId'])
@Index('idx_murmur_likes', ['murmurId'])
@Index('idx_user_likes', ['userId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
}
