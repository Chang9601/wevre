import { join } from 'path';

import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import * as Joi from '@hapi/joi';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

import { UsersModule } from './modules/users/users.module';
import { ItemsModule } from './modules/items/items.module';
import { BidsModule } from './modules/bids/bids.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseConfigService } from './configs/mongoose-config.service';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { OrdersModule } from './modules/orders/orders.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { HealthModule } from './modules/health/health.module';
import { CacheConfigService } from './configs/cache-config.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ItemsModule,
    BidsModule,
    RoomsModule,
    OrdersModule,
    HealthModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'views'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        HOST: Joi.string().required(),
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_DATABASE: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        CACHE_TTL: Joi.number().required(),
        CACHE_MAX: Joi.number().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        skipMissingProperties: true,
      }),
    },
  ],
})
export class AppModule {
  corsOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  };

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors(this.corsOptions), cookieParser(), LoggerMiddleware)
      .forRoutes('*');
  }
}
