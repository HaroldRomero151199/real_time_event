import {
  IsNotEmpty,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class Event {
  id: string;

  @IsNotEmpty({ message: 'Event name is required' })
  @IsString({ message: 'Event name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Room is required' })
  @IsString({ message: 'Room must be a string' })
  room: string;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: Date;

  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
  @ValidateIf((o: Event) => !!(o.startTime && o.endTime))
  endTime: Date;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Domain logic methods
  isOverlapping(otherEvent: Event): boolean {
    if (this.room !== otherEvent.room) return false;

    return (
      (this.startTime < otherEvent.endTime &&
        this.endTime > otherEvent.startTime) ||
      (otherEvent.startTime < this.endTime &&
        otherEvent.endTime > this.startTime)
    );
  }

  isActiveInTimeRange(startRange: Date, endRange: Date): boolean {
    return (
      this.isActive && this.startTime <= endRange && this.endTime >= startRange
    );
  }

  cancel(): void {
    this.isActive = false;
  }
}
