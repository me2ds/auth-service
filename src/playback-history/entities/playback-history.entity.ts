import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Composition } from '../../composition/entities/composition.entity';

@Entity()
export class PlaybackHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Composition)
  @JoinColumn({ name: 'compositionId' })
  composition: Composition;

  @Column()
  compositionId: string;

  @Column({ default: 0 })
  playedDuration: number; // in seconds

  @Column({ default: 0 })
  playCount: number;

  @CreateDateColumn()
  playedAt: Date;
}
