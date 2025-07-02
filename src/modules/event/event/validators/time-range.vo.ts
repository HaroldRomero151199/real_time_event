import { IsDateString, ValidateIf } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class TimeRange {
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: Date;

  @IsDateString({}, { message: 'End time must be a valid date' })
  @ValidateIf((o: TimeRange) => !!o.startTime)
  endTime: Date;

  constructor(startTime: Date, endTime: Date) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.validate();
  }

  private validate(): void {
    if (!this.startTime || !this.endTime) {
      throw new BadRequestException('Start time and end time are required');
    }

    if (this.startTime >= this.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  overlaps(other: TimeRange): boolean {
    return (
      (this.startTime < other.endTime && this.endTime > other.startTime) ||
      (other.startTime < this.endTime && other.endTime > this.startTime)
    );
  }

  contains(date: Date): boolean {
    return date >= this.startTime && date <= this.endTime;
  }

  getDuration(): number {
    return this.endTime.getTime() - this.startTime.getTime();
  }

  isInPast(): boolean {
    return this.endTime < new Date();
  }

  isInFuture(): boolean {
    return this.startTime > new Date();
  }
}
