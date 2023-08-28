import { Module } from '@nestjs/common';

import { MongooseConfigService } from './mongoose-config.service';
import { CacheConfigService } from './cache-config.service';

@Module({
  providers: [MongooseConfigService, CacheConfigService],
  exports: [MongooseConfigService, CacheConfigService],
})
export class CustomConfigModule {}
