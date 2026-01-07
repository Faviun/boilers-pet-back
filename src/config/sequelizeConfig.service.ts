import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createSequelizeOptions(): Promise<SequelizeModuleOptions> {
    const mysql2 = await import('mysql2');

    return {
      dialect: 'mysql',
      dialectModule: mysql2,
      host: this.configService.get<string>('DATABASE_HOST') || 'localhost',
      port: Number(this.configService.get<number>('DATABASE_PORT')) || 3306,
      username: this.configService.get<string>('DATABASE_USER') || 'root',
      password: this.configService.get<string>('DATABASE_PASSWORD') || '',
      database: this.configService.get<string>('DATABASE_NAME') || 'pet1',
      autoLoadModels: true,
      synchronize: true,
      logging: this.configService.get<string>('SQL_LOGGING') === 'true',
    };
  }
}
