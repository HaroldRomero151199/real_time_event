// DTO for creating new events with UUID roomId relation
// This DTO validates the input data for event creation
// Uses roomId (UUID) to reference the Room entity

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Unique name of the event',
    example: 'Tech Conference 2024',
  })
  @IsNotEmpty({ message: 'Event name is required' })
  @IsString({ message: 'Event name must be a string' })
  name: string;

  @ApiProperty({
    description: 'UUID of the room where the event will take place',
    example: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
  })
  @IsNotEmpty({ message: 'Room is required' })
  @IsUUID()
  roomId: string;

  @ApiProperty({
    description: 'Start time of the event in ISO 8601 format',
    example: '2024-01-15T09:00:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date string' })
  startTime: string;

  @ApiProperty({
    description: 'End time of the event',
    example: '2024-01-15T11:00:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date string' })
  endTime: string;
}
