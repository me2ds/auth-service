import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Composition } from '../../composition/entities/composition.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Composition)
  @JoinTable({
    name: 'playlist_composition',
    joinColumn: { name: 'playlistId' },
    inverseJoinColumn: { name: 'compositionId' },
  })
  compositions: Composition[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;
}
