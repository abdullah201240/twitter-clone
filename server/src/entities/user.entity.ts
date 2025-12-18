import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index('idx_email', ['email'], { unique: true })
@Index('idx_username', ['username'], { unique: true })
@Index('idx_created_at', ['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  avatar!: string | null;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  coverImage!: string | null;

  @Column({ nullable: true, type: 'text' })
  bio!: string | null;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  location!: string | null;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  website!: string | null;

  @Column({ default: 0 })
  followersCount!: number;

  @Column({ default: 0 })
  followingCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
