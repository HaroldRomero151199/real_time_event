import { Event } from '../entities/event.model';

export interface IEventRepository {
  save(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findByName(name: string): Promise<Event | null>;
  findByRoom(room: string): Promise<Event[]>;
  findActiveInTimeRange(startTime: Date, endTime: Date): Promise<Event[]>;
  findOverlappingEvents(
    room: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Event[]>;
  findAll(): Promise<Event[]>;
  delete(id: string): Promise<void>;
  update(event: Event): Promise<Event>;
}
