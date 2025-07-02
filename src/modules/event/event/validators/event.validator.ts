import { BadRequestException } from '@nestjs/common';

export class EventValidator {
  validateTimeRange(startTime: Date, endTime: Date): boolean {
    if (startTime >= endTime) {
      throw new BadRequestException(
        `Invalid time range: start time (${startTime.toISOString()}) must be before end time (${endTime.toISOString()})`,
      );
    }
    return true;
  }
}
