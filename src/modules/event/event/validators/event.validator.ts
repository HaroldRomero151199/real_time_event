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

    if (!createEventDto.roomId?.trim()) {
      throw new BadRequestException('Room ID is required and cannot be empty');
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(createEventDto.roomId)) {
      throw new BadRequestException('Room ID must be a valid UUID');
    }

    if (!createEventDto.startTime || !createEventDto.endTime) {
      throw new BadRequestException('Start time and end time are required');
    }

    this.validateTimeRange(createEventDto.startTime, createEventDto.endTime);

    const now = new Date();
    if (createEventDto.startTime < now) {
      throw new BadRequestException('Start time cannot be in the past');
    }

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
