import { NestFactory /*Reflector*/ } from '@nestjs/core';
import { AppModule } from './app.module';
import { /*ClassSerializerInterceptor*/ ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 들어오는 요청이 명시되지 않는 별도의 속성을 바디에 가지고 있는 경우 자동으로 제거
      skipMissingProperties: true, // PATCH 메서드와 같이 부분 수정 시 누락된 속성들을 생략하지만 모든 DTO에서 누락된 속성들을 생략할 수 있기 때문에 PATCH 업데이트할 때 모든 속성에 IsOptional을 추가
    }),
  );

  // 직렬화(사용자에게 반환하기 전 응답 수정) 전역 설정
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Wevre')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
