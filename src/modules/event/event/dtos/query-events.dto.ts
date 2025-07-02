import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, ValidateIf } from 'class-validator';

export class QueryEventsDto {
  @ApiProperty({
    description: 'Start time of the query range',
    example: '2024-01-15T10:00:00Z',
    type: Date,
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the query range',
    example: '2024-01-15T10:45:00Z',
    type: Date,
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
  @ValidateIf(
    (object: QueryEventsDto, value: Date) =>
      object.startTime != null && value != null,
  )
  endTime: Date;
}
