import { HttpException, HttpStatus } from '@nestjs/common';

export class EventNotFoundException extends HttpException {
  constructor(eventName: string) {
    super(`Event with name "${eventName}" not found`, HttpStatus.NOT_FOUND);
  }
}

export class EventOverlapException extends HttpException {
  constructor(startTime: Date, message: string) {
    super(
      `${message}. Start time: ${startTime.toISOString()}`,
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

export class PastEventException extends HttpException {
  constructor(startTime: Date, message: string) {
    super(
      `${message}. Start time: ${startTime.toISOString()}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
