import * as path from 'path';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// HTTP 404 페이지 필터.
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode = exception.getStatus();

    const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const method = request.method;

    if (methods.includes(method)) {
      const timestamp = new Date().toISOString();
      const path = request.originalUrl;
      const message = exception.message;

      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp,
        path,
      });
    }

    const options = {
      root:
        process.env.NODE_ENV === 'test'
          ? path.join(__dirname, '..', 'public')
          : path.join(__dirname, '..', '..', 'public'),
    };

    return response.status(statusCode).sendFile('dne.html', options);
  }
}
