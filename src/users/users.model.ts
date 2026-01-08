import { Table, Column, Model, DataType } from 'sequelize-typescript';
import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

@Table
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;
}
