import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const { method, originalUrl } = request;
      const { statusCode, statusMessage } = response;

      const message = `요청: ${method} ${originalUrl} , 응답: ${statusCode} ${statusMessage}`;
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.logger.error(message);
      } else if (statusCode >= HttpStatus.BAD_REQUEST) {
        return this.logger.warn(message);
      } else {
        return this.logger.log(message);
      }
    });

    next();
  }
}
