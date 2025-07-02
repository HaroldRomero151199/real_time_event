// Events service with UUID support and Room relations
// Handles business logic for event creation, querying, and management
// Uses roomId (UUID) to reference Room entities

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

interface RoomData {
  id: string;
  name: string;
  capacity?: number;
  isActive: boolean;
}

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

    // Validate that start time is not in the past (optional business rule)
    const now = new Date();
    if (createEventDto.startTime < now) {
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

    // Check for overlapping events in the same room (using roomId)
    const overlappingEvents = await this.eventRepository.findOverlappingEvents(
      createEventDto.roomId,
      createEventDto.startTime,
      createEventDto.endTime,
    );

    if (overlappingEvents.length > 0) {
      throw new EventOverlapException(
        createEventDto.name,
        createEventDto.roomId,
        createEventDto.startTime,
        createEventDto.endTime,
      );
    }

    // Create new event
    const event = new Event();
    event.name = createEventDto.name.trim();
    event.roomId = createEventDto.roomId; // Use roomId (UUID)
    event.startTime = new Date(createEventDto.startTime);
    event.endTime = new Date(createEventDto.endTime);
    event.isActive = true;
    event.createdAt = new Date();
    event.updatedAt = new Date();

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
    const roomReports: OccupancyReportDto[] = [];
    let totalEvents = 0;
    let totalActiveEvents = 0;

    eventsByRoom.forEach((events, roomId) => {
      const activeEvents = events.filter((event) => event.isActive);
      const currentlyActiveEvents = events.filter((event) =>
        event.isCurrentlyActive(),
      );

      // Get room name from first event's room relation
      const firstEvent = events[0];
      const roomName = firstEvent?.room && typeof firstEvent.room === 'object' && 'name' in firstEvent.room 
        ? (firstEvent.room as RoomData).name 
        : `Room ${roomId}`;

      roomReports.push({
        roomId,
        roomName,
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          roomId: event.roomId,
          room: event.room && typeof event.room === 'object'
            ? {
                id: (event.room as RoomData).id,
                name: (event.room as RoomData).name,
                capacity: (event.room as RoomData).capacity,
                isActive: (event.room as RoomData).isActive,
              }
            : undefined,
          startTime: event.startTime,
          endTime: event.endTime,
          isActive: event.isActive,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })),
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        currentlyActiveEvents: currentlyActiveEvents.length,
      });

      totalEvents += events.length;
      totalActiveEvents += activeEvents.length;
    });

    return {
      rooms: roomReports,
      totalRooms: eventsByRoom.size,
      totalEvents,
      totalActiveEvents,
      generatedAt: new Date(),
    };
  }

  // Additional helper methods for extensibility

  async getCurrentlyActiveEvents(): Promise<Event[]> {
    const allEvents = await this.eventRepository.findAll();
    return allEvents.filter((event) => event.isCurrentlyActive());
  }

  async getUpcomingEvents(hours: number = 24): Promise<Event[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const allEvents = await this.eventRepository.findAll();
    return allEvents.filter(
      (event) =>
        event.isActive &&
        event.startTime >= now &&
        event.startTime <= futureTime,
    );
  }
}
