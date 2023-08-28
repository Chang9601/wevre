import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdpaterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdpaterHost;

    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    console.log(exception);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 오류 발생.';
    const timestamp = new Date().toISOString();
    const path = httpAdapter.getRequestUrl(request);

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as {
        statusCode: string;
        message: string | string[];
        error: string;
      };

      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(' | ')
        : exceptionResponse.message;

      statusCode = exception.getStatus();
    }

    const body = {
      statusCode,
      message,
      timestamp,
      path,
    };

    httpAdapter.reply(response, body, statusCode);
  }
}
