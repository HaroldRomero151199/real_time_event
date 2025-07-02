import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2024',
    type: String,
  })
  @IsNotEmpty({ message: 'Event name is required' })
  @IsString({ message: 'Event name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Room where the event will take place',
    example: 'Room 1',
    type: String,
  })
  @IsNotEmpty({ message: 'Room is required' })
  @IsString({ message: 'Room must be a string' })
  room: string;

  @ApiProperty({
    description: 'Start time of the event',
    example: '2024-01-15T09:00:00Z',
    type: Date,
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the event',
    example: '2024-01-15T11:00:00Z',
    type: Date,
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
  @ValidateIf(
    (object: CreateEventDto, value: Date) =>
      object.startTime != null && value != null,
  )
  endTime: Date;
}
