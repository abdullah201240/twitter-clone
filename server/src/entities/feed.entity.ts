import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity('feed')
@Index('idx_user_created', ['userId', 'createdAt'])
@Index('idx_murmur_user', ['murmurId', 'userId'])
export class Feed {
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
