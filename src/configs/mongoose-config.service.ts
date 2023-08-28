import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    return {
      uri: `mongodb://${this.getEnv('DB_USERNAME')}:${this.getEnv(
        'DB_PASSWORD',
      )}@${this.getEnv('DB_HOST')}:${this.getEnv('DB_PORT')}/${this.getEnv(
        'DB_DATABASE',
      )}`,
    };
  }

  // TypeORM과 달리 Mongoose는 포트가 문자열이어도 오류가 발생하지 않는다.
  private getEnv(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`환경 변수 ${key}가 설정되지 않음.`);
    }

    return value;
  }
}
