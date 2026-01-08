import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { FindOptions } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  // 🔎 Найти одного пользователя
  findOne(filter: FindOptions<User>): Promise<User | null> {
    return this.userModel.findOne(filter);
  }

  // 🧑‍💻 Создание пользователя
  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | { warningMessage: string }> {
    const { username, email, password } = createUserDto;

    // Проверка username
    const existingByUsername = await this.findOne({
      where: { username },
    });

    if (existingByUsername) {
      return { warningMessage: 'Пользователь с таким именем уже существует' };
    }

    // Проверка email
    const existingByEmail = await this.findOne({
      where: { email },
    });

    if (existingByEmail) {
      return { warningMessage: 'Пользователь с таким email уже существует' };
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // ❗ ВАЖНО: используем create(), а не new User()
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    return user;
  }
}
