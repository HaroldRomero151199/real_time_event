// Event entity model with UUID primary key and Room relation
// This model represents an event in the system with business logic methods
// Uses roomId (UUID) to reference the Room entity

export class Event {
  id: string; // UUID primary key
  name: string;
  roomId: string; // UUID foreign key to Room
  room?: any; // Room relation (optional for queries)
  // Dates are Date in model, string in DTO
  startTime: Date; // ISO 8601 date
  endTime: Date; // ISO 8601 date
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Business logic methods
  isOverlapping(otherEvent: Event): boolean {
    // Check if events overlap in the same room
    if (this.roomId !== otherEvent.roomId) return false;

    return (
      (this.startTime < otherEvent.endTime &&
        this.endTime > otherEvent.startTime) ||
      (otherEvent.startTime < this.endTime &&
        otherEvent.endTime > this.startTime)
    );
  }

  isActiveInTimeRange(startRange: Date, endRange: Date): boolean {
    return (
      this.isActive &&
      ((this.startTime >= startRange && this.startTime < endRange) ||
        (this.endTime > startRange && this.endTime <= endRange) ||
        (this.startTime <= startRange && this.endTime >= endRange))
    );
  }

  isCurrentlyActive(): boolean {
    const now = new Date();
    return this.isActive && this.startTime <= now && this.endTime > now;
  }

  getDurationInMinutes(): number {
    return Math.floor(
      (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60),
    );
  }

  cancel(): void {
    this.isActive = false;
  }
}
