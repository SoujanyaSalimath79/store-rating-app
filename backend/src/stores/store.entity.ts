import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Rating } from './rating.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 400 })
  address: string;

  @Column({ nullable: true })
  ownerId: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Rating, (r) => r.store)
  ratings: Rating[];

  @CreateDateColumn()
  createdAt: Date;
}
