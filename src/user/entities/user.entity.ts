import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;
}
