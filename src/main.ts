import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as mongoose from 'mongoose';

import { AppModule } from './app.module';
import { SocketIoAdapter } from './modules/bids/adapters/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // Mongoose 로깅 활성화.
  mongoose.set('debug', true);

  const configService = app.get(ConfigService);

  const socketIoAdapter = new SocketIoAdapter(app);
  await socketIoAdapter.connectToRedis();

  app.useWebSocketAdapter(socketIoAdapter);

  const config = new DocumentBuilder()
    .setTitle('Wevre')
    .setDescription(
      '예술품을 실시간 경매로 거래하는 서비스 Wevre 의 API 문서화',
    )
    .setVersion('1.0')
    .addTag('Wevre')
    .addCookieAuth('token cookie')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('PORT') || 3000);
}
bootstrap();
