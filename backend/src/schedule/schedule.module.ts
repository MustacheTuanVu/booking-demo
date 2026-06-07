import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SystemModule } from 'src/system/system.module';

@Module({
  providers: [ScheduleService],
  imports: [SystemModule]
})
export class ScheduleModule {}
