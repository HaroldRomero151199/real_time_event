import { Module } from '@nestjs/common';
import { EventsModule } from './event/events.module';

@Module({
  imports: [EventsModule],
  exports: [EventsModule],
})
export class EventModule {}
