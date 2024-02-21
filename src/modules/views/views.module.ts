import { Module } from '@nestjs/common';

import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';

@Module({
  providers: [ViewsService],
  controllers: [ViewsController],
})
export class ViewsModule {}
