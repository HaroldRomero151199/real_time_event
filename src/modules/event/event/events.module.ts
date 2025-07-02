import { Module } from '@nestjs/common';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { EventPrismaRepository } from './repositories/events.repository';
import { PrismaService } from './prisma/prisma.service';
import { EVENT_REPOSITORY } from './tokens';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    PrismaService,
    {
      provide: EVENT_REPOSITORY,
      useClass: EventPrismaRepository,
    },
  ],
  exports: [EVENT_REPOSITORY],
})
export class EventsModule {}
