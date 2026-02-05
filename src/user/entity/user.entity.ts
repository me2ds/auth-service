import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { Composition } from '../../composition/entities/composition.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  authIds: string[];

  @Column()
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => Playlist, (playlist) => playlist.owner)
  playlists: Playlist[];

  @OneToMany(() => Composition, (composition) => composition.owner)
  compositions: Composition[];

  @ManyToMany(() => User, (user) => user.friendsOf)
  @JoinTable({
    name: 'user_friends',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'friendId' },
  })
  friends: User[];

  @ManyToMany(() => User, (user) => user.friends)
  friendsOf: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
