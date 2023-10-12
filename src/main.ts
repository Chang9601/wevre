import { NestFactory /*Reflector*/ } from '@nestjs/core';
import {
  /*ClassSerializerInterceptor*/
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CustomSocketIoAdapter } from './modules/bids/adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: true,
    }),
  );

  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  app.use(cookieParser());

  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Wevre')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);

  await app.listen(configService.get<string>('PORT') || 3000);
}
bootstrap();
