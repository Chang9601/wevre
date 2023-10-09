import { join } from 'path';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as Joi from '@hapi/joi';

import { UsersModule } from './modules/users/users.module';
import { ItemsModule } from './modules/items/items.module';
import { BidsModule } from './modules/bids/bids.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfigService } from './config/mongoose-config.service';
import { AllHttpExceptionFilter } from './filter/all-exception.filter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'views'),
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
      }),
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    BidsModule,
    RoomsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
