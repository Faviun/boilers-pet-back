import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ivan',
    description: 'Имя пользователя',
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    example: 'ivan12345',
    description: 'Пароль (минимум 6 символов)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({
    example: 'ivan@gmail.com',
    description: 'Email пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
