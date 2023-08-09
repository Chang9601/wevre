import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  private readonly envConfig: Record<string, string>;

  constructor() {
    this.envConfig = process.env;
  }

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    return {
      uri: `mongodb://${this.getConfig('DB_USERNAME')}:${this.getConfig(
        'DB_PASSWORD',
      )}@${this.getConfig('DB_HOST')}:${+this.getConfig(
        'DB_PORT',
      )}/${this.getConfig('DB_DATABASE')}`,
    };
  }

  private getConfig(key: string): string {
    return this.envConfig[key];
  }
}
