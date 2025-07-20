import { Column, Model, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'movies', timestamps: true })
export class Movie extends Model<Movie> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  movieName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  movieDes!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  yearOfPublished!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  moviePoster?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  userId!: string;
}
