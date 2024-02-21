import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

import { UsersModule } from './modules/users/users.module';
import { ItemsModule } from './modules/items/items.module';
import { BidsModule } from './modules/bids/bids.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { HealthModule } from './modules/health/health.module';
import { ViewsModule } from './modules/views/views.module';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { MongooseConfigService } from './configs/mongoose-config.service';
import { CacheConfigService } from './configs/cache-config.service';
import { validationSchema } from './configs/validation-schema';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ItemsModule,
    BidsModule,
    RoomsModule,
    OrdersModule,
    HealthModule,
    ViewsModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: validationSchema,
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
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
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
