import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2024',
  })
  name: string;

  @ApiProperty({
    description: 'Room where the event takes place',
    example: 'Room 1',
  })
  room: string;

  @ApiProperty({
    description: 'Start time of the event',
    example: '2024-01-15T09:00:00Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the event',
    example: '2024-01-15T11:00:00Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Whether the event is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T08:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T08:00:00Z',
  })
  updatedAt: Date;
}

export class EventsQueryResponseDto {
  @ApiProperty({
    description: 'List of active events in the specified time range',
    type: [EventResponseDto],
  })
  events: EventResponseDto[];

  @ApiProperty({
    description: 'Total count of events found',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Query time range start',
    example: '2024-01-15T10:00:00Z',
  })
  queryStartTime: Date;

  @ApiProperty({
    description: 'Query time range end',
    example: '2024-01-15T10:45:00Z',
  })
  queryEndTime: Date;
}

export class OccupancyReportDto {
  @ApiProperty({
    description: 'Room name',
    example: 'Room 1',
  })
  room: string;

  @ApiProperty({
    description: 'List of events in this room',
    type: [EventResponseDto],
  })
  events: EventResponseDto[];

  @ApiProperty({
    description: 'Total events in this room',
    example: 3,
  })
  totalEvents: number;

  @ApiProperty({
    description: 'Active events in this room',
    example: 2,
  })
  activeEvents: number;
}

export class OccupancyReportResponseDto {
  @ApiProperty({
    description: 'List of room occupancy reports',
    type: [OccupancyReportDto],
  })
  rooms: OccupancyReportDto[];

  @ApiProperty({
    description: 'Total rooms',
    example: 3,
  })
  totalRooms: number;

  @ApiProperty({
    description: 'Total events across all rooms',
    example: 8,
  })
  totalEvents: number;

  @ApiProperty({
    description: 'Total active events',
    example: 6,
  })
  totalActiveEvents: number;
}
