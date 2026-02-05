import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Playlist } from '../../playlist/entities/playlist.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPrivate: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'room_members',
    joinColumn: { name: 'roomId' },
    inverseJoinColumn: { name: 'userId' },
  })
  members: User[];

  @ManyToOne(() => Playlist, { nullable: true })
  @JoinColumn({ name: 'currentPlaylistId' })
  currentPlaylist: Playlist;

  @Column({ nullable: true })
  currentPlaylistId: string;

  @Column({ default: 0 })
  currentTrackIndex: number;

  @Column({ default: 0 })
  currentPosition: number; // in seconds

  @Column({ default: false })
  isPlaying: boolean;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
