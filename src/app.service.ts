import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '위브르에 오신 걸 환영합니다!';
  }
}
