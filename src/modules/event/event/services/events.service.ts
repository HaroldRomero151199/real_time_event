// Events service with UUID support and Room relations
// Handles business logic for event creation, querying, and management
// Uses roomId (UUID) to reference Room entities

import { Injectable, Inject } from '@nestjs/common';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';
import { Event } from '../entities/event.entity';
import { IEventRepository } from '../repositories/event-repository.interface';
import { EVENT_REPOSITORY } from '../tokens';
import {
  OccupancyReportResponseDto,
  RoomOccupancyDto,
} from '../dtos/event-response.dto';
import {
  EventOverlapException,
  InvalidTimeRangeException,
  EventNotFoundException,
  PastEventException,
} from '../exceptions/event-exceptions';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);

    // Basic validation
    if (startTime >= endTime) {
      throw new InvalidTimeRangeException(startTime, endTime);
    }

    const now = new Date();
    if (startTime < now) {
      throw new PastEventException(
        startTime,
        'Events cannot be scheduled in the past',
      );
    }

    // Check for overlapping events in the same room
    const overlappingEvents = await this.eventRepository.findOverlappingEvents(
      createEventDto.roomId,
      startTime,
      endTime,
    );

    if (overlappingEvents.length > 0) {
      throw new EventOverlapException(
        startTime,
        'Event overlaps with existing events',
      );
    }

    // Create new event
    const event = new Event();
    event.name = createEventDto.name.trim();
    event.roomId = createEventDto.roomId;
    event.startTime = startTime;
    event.endTime = endTime;
    event.isActive = true;
    event.createdAt = new Date();
    event.updatedAt = new Date();

    return this.eventRepository.save(event);
  }

  async queryEvents(queryDto: QueryEventsDto): Promise<Event[]> {
    const startTime = new Date(queryDto.startTime);
    const endTime = new Date(queryDto.endTime);

    if (startTime >= endTime) {
      throw new InvalidTimeRangeException(startTime, endTime);
    }

    const events = await this.eventRepository.findAll();
    return events.filter((event) =>
      event.isActiveInTimeRange(startTime, endTime),
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
    event.updatedAt = new Date();
    return this.eventRepository.update(event);
  }

  async generateOccupancyReport(): Promise<OccupancyReportResponseDto> {
    const allEvents = await this.eventRepository.findAll();

    // Group events by room
    const eventsByRoom = new Map<string, Event[]>();
    allEvents.forEach((event) => {
      if (!eventsByRoom.has(event.roomId)) {
        eventsByRoom.set(event.roomId, []);
      }
      eventsByRoom.get(event.roomId)!.push(event);
    });

    // Create room reports
    const rooms: RoomOccupancyDto[] = [];
    let totalEvents = 0;
    let totalActiveEvents = 0;
    let totalCurrentlyActive = 0;

    eventsByRoom.forEach((events, roomId) => {
      const activeEvents = events.filter((event) => event.isActive);
      const currentlyActiveEvents = events.filter((event) =>
        event.isCurrentlyActive ? event.isCurrentlyActive() : false,
      );

      rooms.push({
        roomId,
        roomName: `Room ${roomId}`,
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          roomId: event.roomId,
          room: undefined,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          isActive: event.isActive,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        })),
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        currentlyActiveEvents: currentlyActiveEvents.length,
      });

      totalEvents += events.length;
      totalActiveEvents += activeEvents.length;
      totalCurrentlyActive += currentlyActiveEvents.length;
    });

    return {
      rooms,
      totalRooms: eventsByRoom.size,
      totalEvents,
      activeEvents: totalActiveEvents,
      currentlyActiveEvents: totalCurrentlyActive,
      generatedAt: new Date().toISOString(),
    };
  }

  async getCurrentlyActiveEvents(): Promise<Event[]> {
    const allEvents = await this.eventRepository.findAll();
    return allEvents.filter((event) => {
      if (!event.isActive) {
        return false;
      }
      // Check if event is currently happening (between start and end time)
      const now = new Date();
      return event.startTime <= now && event.endTime > now;
    });
  }
}
