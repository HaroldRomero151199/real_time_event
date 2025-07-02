// Events controller with UUID support and Room relations
// Handles HTTP requests for event management operations
// Maps responses to include roomId (UUID) and room information

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';

import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';

import {
  EventResponseDto,
  EventsQueryResponseDto,
  OccupancyReportResponseDto,
  RoomResponseDto,
} from '../dtos/event-response.dto';
import { ResponseWrapperDto } from '../../../../common/dtos/response-wrapper.dto';

interface EventData {
  id: string;
  name: string;
  roomId: string; // Use roomId (UUID)
  room?: RoomData; // Room relation
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getDurationInMinutes?: () => number;
  isCurrentlyActive?: () => boolean;
}

interface RoomData {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
}

@ApiTags('Events Management')
@Controller('events') // With global prefix: /api/v1/events
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Register a new event ensuring no overlaps in the same room',
  })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(EventResponseDto) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or business rule violation',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - event overlaps with existing events or name already exists',
  })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.createEvent(createEventDto);
    return this.mapToEventResponse(event);
  }

  @Get('query')
  @ApiOperation({
    summary: 'Query active events in time range',
    description:
      'Find all active events within a specified time range across all rooms',
  })
  @ApiResponse({
    status: 200,
    description: 'Events found successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(EventsQueryResponseDto) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid time range',
  })
  async queryEvents(
    @Query() queryDto: QueryEventsDto,
  ): Promise<EventsQueryResponseDto> {
    const events = await this.eventsService.queryEvents(queryDto);

    return {
      events: events.map((event) => this.mapToEventResponse(event)),
      total: events.length,
      queryStartTime: queryDto.startTime,
      queryEndTime: queryDto.endTime,
    };
  }

  @Post(':name/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel an event',
    description: 'Cancel an event by its name',
  })
  @ApiParam({
    name: 'name',
    description: 'Name of the event to cancel',
    example: 'Tech Conference 2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Event cancelled successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(EventResponseDto) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Event is already cancelled',
  })
  async cancelEvent(
    @Param('name') eventName: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.cancelEvent(eventName);
    return this.mapToEventResponse(event);
  }

  @Get('occupancy-report')
  @ApiOperation({
    summary: 'Generate occupancy report',
    description:
      'Generate a comprehensive report of all rooms and their events',
  })
  @ApiResponse({
    status: 200,
    description: 'Occupancy report generated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(OccupancyReportResponseDto) },
          },
        },
      ],
    },
  })
  async generateOccupancyReport(): Promise<OccupancyReportResponseDto> {
    const report = await this.eventsService.generateOccupancyReport();

    return {
      ...report,
      rooms: report.rooms.map((room) => ({
        roomId: room.roomId,
        roomName: room.roomName,
        events: room.events.map((event) => ({
          id: event.id,
          name: event.name,
          roomId: event.roomId,
          room: event.room,
          startTime: event.startTime,
          endTime: event.endTime,
          isActive: event.isActive,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })),
        totalEvents: room.totalEvents,
        activeEvents: room.activeEvents,
        currentlyActiveEvents: room.currentlyActiveEvents,
      })),
    };
  }

  // Additional endpoints for extensibility
  @Get('currently-active')
  @ApiOperation({
    summary: 'Get currently active events',
    description: 'Get all events that are currently happening',
  })
  @ApiResponse({
    status: 200,
    description: 'Currently active events retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(EventResponseDto) },
            },
          },
        },
      ],
    },
  })
  async getCurrentlyActiveEvents(): Promise<EventResponseDto[]> {
    const events = await this.eventsService.getCurrentlyActiveEvents();
    return events.map((event) => this.mapToEventResponse(event));
  }

  private mapToEventResponse(event: EventData): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      roomId: event.roomId,
      startTime:
        event.startTime instanceof Date
          ? event.startTime.toISOString()
          : event.startTime,
      endTime:
        event.endTime instanceof Date
          ? event.endTime.toISOString()
          : event.endTime,
      createdAt:
        event.createdAt instanceof Date
          ? event.createdAt.toISOString()
          : event.createdAt,
      updatedAt:
        event.updatedAt instanceof Date
          ? event.updatedAt.toISOString()
          : event.updatedAt,
      isActive: event.isActive,
      room: event.room,
      durationInMinutes: event.getDurationInMinutes
        ? event.getDurationInMinutes()
        : undefined,
      isCurrentlyActive: event.isCurrentlyActive
        ? event.isCurrentlyActive()
        : undefined,
    };
  }

  private mapToRoomResponse(room: RoomData): RoomResponseDto {
    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      isActive: room.isActive,
    };
  }
}
