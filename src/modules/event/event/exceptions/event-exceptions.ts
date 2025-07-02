import { HttpException, HttpStatus } from '@nestjs/common';

export class EventNotFoundException extends HttpException {
  constructor(eventName: string) {
    super(`Event with name "${eventName}" not found`, HttpStatus.NOT_FOUND);
  }
}

export class EventOverlapException extends HttpException {
  constructor(eventName: string, room: string, startTime: Date, endTime: Date) {
    super(
      `Event "${eventName}" overlaps with existing events in room "${room}" between ${startTime.toISOString()} and ${endTime.toISOString()}`,
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidTimeRangeException extends HttpException {
  constructor(startTime: Date, endTime: Date) {
    super(
      `Invalid time range: start time (${startTime.toISOString()}) must be before end time (${endTime.toISOString()})`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class EventAlreadyExistsException extends HttpException {
  constructor(eventName: string) {
    super(`Event with name "${eventName}" already exists`, HttpStatus.CONFLICT);
  }
}
