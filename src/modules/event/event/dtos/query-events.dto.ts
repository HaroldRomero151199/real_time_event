import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class QueryEventsDto {
  @ApiProperty({
    description: 'Start time of the query range',
    example: '2024-01-15T10:00:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date string' })
  startTime: string;

  @ApiProperty({
    description: 'End time of the query range',
    example: '2024-01-15T10:45:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date string' })
  endTime: string;
}
