import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
  Unique,
  DataSource,
} from "typeorm";
import "reflect-metadata";
import { config } from "../config";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  tgId!: string;

  @Column()
  googleAuthInfo!: string;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.PG_DATABASE_HOST,
  port: config.PG_PORT,
  username: config.PG_USER,
  password: config.PG_PASSWORD,
  database: config.PG_DATABASE,
  synchronize: true, // Auto-create tables in dev mode
  logging: true,
  entities: [User],
});
