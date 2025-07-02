import { Injectable, Inject } from '@nestjs/common';
import { Event } from '../entities/event.model';
import { IEventRepository } from '../repositories/event-repository.interface';
import { EVENT_REPOSITORY } from '../tokens';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';
import {
  EventOverlapException,
  EventAlreadyExistsException,
  InvalidTimeRangeException,
  EventNotFoundException,
} from '../exceptions/event-exceptions';
import {
  OccupancyReportResponseDto,
  OccupancyReportDto,
} from '../dtos/event-response.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    // Validate time range
    if (createEventDto.startTime >= createEventDto.endTime) {
      throw new InvalidTimeRangeException(
        createEventDto.startTime,
        createEventDto.endTime,
      );
    }

    // Check if event with same name already exists
    const existingEvent = await this.eventRepository.findByName(
      createEventDto.name,
    );
    if (existingEvent) {
      throw new EventAlreadyExistsException(createEventDto.name);
    }

    // Check for overlapping events in the same room
    const overlappingEvents = await this.eventRepository.findOverlappingEvents(
      createEventDto.room,
      createEventDto.startTime,
      createEventDto.endTime,
    );

    if (overlappingEvents.length > 0) {
      throw new EventOverlapException(
        createEventDto.name,
        createEventDto.room,
        createEventDto.startTime,
        createEventDto.endTime,
      );
    }

    // Create new event
    const event = new Event();
    event.name = createEventDto.name;
    event.room = createEventDto.room;
    event.startTime = createEventDto.startTime;
    event.endTime = createEventDto.endTime;
    event.isActive = true;

    return this.eventRepository.save(event);
  }

  async queryEvents(queryDto: QueryEventsDto): Promise<Event[]> {
    // Validate time range
    if (queryDto.startTime >= queryDto.endTime) {
      throw new InvalidTimeRangeException(queryDto.startTime, queryDto.endTime);
    }

    // Find all active events that overlap with the query time range
    const allEvents = await this.eventRepository.findAll();
    return allEvents.filter(
      (event) =>
        event.isActive &&
        event.isActiveInTimeRange(queryDto.startTime, queryDto.endTime),
    );
  }

  async cancelEvent(eventName: string): Promise<Event> {
    const event = await this.eventRepository.findByName(eventName);
    if (!event) {
      throw new EventNotFoundException(eventName);
    }

    if (!event.isActive) {
      throw new Error(`Event "${eventName}" is already cancelled`);
    }

    event.cancel();
    return this.eventRepository.update(event);
  }

  async generateOccupancyReport(): Promise<OccupancyReportResponseDto> {
    const allEvents = await this.eventRepository.findAll();
    // Group events by room
    const eventsByRoom = new Map<string, Event[]>();
    allEvents.forEach((event) => {
      if (!eventsByRoom.has(event.room)) {
        eventsByRoom.set(event.room, []);
      }
      eventsByRoom.get(event.room)!.push(event);
    });

    // Create room reports
    const roomReports: OccupancyReportDto[] = [];
    let totalEvents = 0;
    let totalActiveEvents = 0;

    for (const [room, events] of eventsByRoom) {
      const activeEvents = events.filter((event) => event.isActive);

      roomReports.push({
        room,
        events,
        totalEvents: events.length,
        activeEvents: activeEvents.length,
      });

      totalEvents += events.length;
      totalActiveEvents += activeEvents.length;
    }

    return {
      rooms: roomReports,
      totalRooms: eventsByRoom.size,
      totalEvents,
      totalActiveEvents,
    };
  }
}
