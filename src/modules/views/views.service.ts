import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ViewsService {
  constructor(private readonly configService: ConfigService) {}

  async findCredentials() {
    const naverClientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const naverCallbackUri =
      this.configService.get<string>('NAVER_CALLBACK_URI');

    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleCallbackUri = this.configService.get<string>(
      'GOOGLE_CALLBACK_URI',
    );

    return {
      naverClientId,
      naverCallbackUri,
      googleClientId,
      googleCallbackUri,
    };
  }
}
