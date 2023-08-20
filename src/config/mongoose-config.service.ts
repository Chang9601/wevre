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

  private getEnv(key: string): string | number {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`Environment variable ${key} not set`);
    }

    return value;
  }
}
