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
} from '@nestjs/swagger';

import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';
import {
  EventResponseDto,
  EventsQueryResponseDto,
  OccupancyReportResponseDto,
} from '../dtos/event-response.dto';

@ApiTags('Events Management')
@Controller('v1/events')
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
    type: EventResponseDto,
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
    type: EventsQueryResponseDto,
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
    type: EventResponseDto,
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
    type: OccupancyReportResponseDto,
  })
  async generateOccupancyReport(): Promise<OccupancyReportResponseDto> {
    const report = await this.eventsService.generateOccupancyReport();

    return {
      ...report,
      rooms: report.rooms.map((room) => ({
        ...room,
        events: room.events.map((event) => this.mapToEventResponse(event)),
      })),
    };
  }

  private mapToEventResponse(event: any): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      room: event.room,
      startTime: event.startTime,
      endTime: event.endTime,
      isActive: event.isActive,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
