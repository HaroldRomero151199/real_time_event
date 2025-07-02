import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';

@Injectable()
export class EventValidator {
  validateTimeRange(startTime: Date, endTime: Date): boolean {
    if (!startTime || !endTime) {
      throw new BadRequestException('Start time and end time are required');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return true;
  }

  validateEventData(createEventDto: CreateEventDto): boolean {
    if (!createEventDto.name?.trim()) {
      throw new BadRequestException(
        'Event name is required and cannot be empty',
      );
    }

    if (!createEventDto.room?.trim()) {
      throw new BadRequestException('Room is required and cannot be empty');
    }

    if (!createEventDto.startTime || !createEventDto.endTime) {
      throw new BadRequestException('Start time and end time are required');
    }

    this.validateTimeRange(createEventDto.startTime, createEventDto.endTime);

    return true;
  }

  validateQueryData(queryDto: QueryEventsDto): boolean {
    if (!queryDto.startTime || !queryDto.endTime) {
      throw new BadRequestException(
        'Start time and end time are required for query',
      );
    }

    this.validateTimeRange(queryDto.startTime, queryDto.endTime);

    return true;
  }

  validateEventName(name: string): boolean {
    if (!name?.trim()) {
      throw new BadRequestException(
        'Event name is required and cannot be empty',
      );
    }

    if (name.length < 3) {
      throw new BadRequestException(
        'Event name must be at least 3 characters long',
      );
    }

    return true;
  }
}
