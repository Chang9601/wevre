import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const redisOptions = {
      host: this.getEnv('REDIS_HOST'),
      port: parseInt(this.getEnv('REDIS_PORT')),
    };

    return {
      ttl: parseInt(this.getEnv('CACHE_TTL')),
      max: parseInt(this.getEnv('CACHE_MAX')),
      store: redisStore,
      ...redisOptions,
    };
  }

  private getEnv(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`환경 변수 ${key}가 설정되지 않음.`);
    }

    return value;
  }
}
