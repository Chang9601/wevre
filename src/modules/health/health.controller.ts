import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @ApiOkResponse({
    description: '헬스체크 성공.',
  })
  @ApiServiceUnavailableResponse({
    description: '헬스체크 실패.',
  })
  @HealthCheck()
  @Get('')
  healthcheck() {
    return this.health.check([() => this.mongoose.pingCheck('database')]);
  }
}
