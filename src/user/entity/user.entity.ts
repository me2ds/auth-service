import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Playlist } from "../../playlist/entities/playlist.entity";
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

  @OneToMany(() => Playlist, (playlist) => playlist.owner)
  playlists: Playlist[];

  @OneToMany(() => Composition, (composition) => composition.owner)
  compositions: Composition[];
}