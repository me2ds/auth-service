import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { array: true })
  authIds: string[]

  @Column()
  username: string

  @Column({ nullable: true })
  avatar: string
}