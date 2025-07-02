// DTOs for event responses with UUID support and Room relations
// These DTOs define the structure of API responses for events
// Include room information and use UUIDs for relationships

import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    description: 'UUID of the room',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the room',
    example: 'Room 1',
  })
  name: string;

  @ApiProperty({
    description: 'Capacity of the room',
    example: 100,
  })
  capacity?: number;

  @ApiProperty({
    description: 'Whether the room is active',
    example: true,
  })
  isActive: boolean;
}

export class EventResponseDto {
  @ApiProperty({
    description: 'UUID of the event',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2024',
  })
  name: string;

  @ApiProperty({
    description: 'UUID of the room where the event takes place',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: 'Room information',
    type: RoomResponseDto,
  })
  room?: RoomResponseDto;

  @ApiProperty({
    description: 'Start time of the event',
    example: '2024-01-15T09:00:00Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the event',
    example: '2024-01-15T11:00:00Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether the event is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'When the event was created',
    example: '2024-01-15T08:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'When the event was last updated',
    example: '2024-01-15T08:00:00Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Duration of the event in minutes',
    example: 120,
  })
  durationInMinutes?: number;

  @ApiProperty({
    description: 'Whether the event is currently active',
    example: true,
  })
  isCurrentlyActive?: boolean;
}

export class EventsQueryResponseDto {
  @ApiProperty({
    description: 'List of events found',
    type: [EventResponseDto],
  })
  events: EventResponseDto[];

  @ApiProperty({
    description: 'Total number of events found',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Start time of the query range',
    example: '2024-01-15T10:00:00Z',
  })
  queryStartTime: string;

  @ApiProperty({
    description: 'End time of the query range',
    example: '2024-01-15T10:45:00Z',
  })
  queryEndTime: string;
}

export class RoomOccupancyDto {
  @ApiProperty()
  roomId: string;

  @ApiProperty()
  roomName: string;

  @ApiProperty({ type: [EventResponseDto] })
  events: EventResponseDto[];

  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  activeEvents: number;

  @ApiProperty()
  currentlyActiveEvents: number;
}

export class OccupancyReportResponseDto {
  @ApiProperty({ type: [RoomOccupancyDto] })
  rooms: RoomOccupancyDto[];

  @ApiProperty()
  totalRooms: number;

  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  activeEvents: number;

  @ApiProperty()
  currentlyActiveEvents: number;

  @ApiProperty({ type: String })
  generatedAt: string;
}
