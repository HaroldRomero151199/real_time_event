import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '../entities/event.model';
import { IEventRepository } from './event-repository.interface';

@Injectable()
export class EventPrismaRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: Event): Promise<Event> {
    const result = await this.prisma.event.create({
      data: {
        name: event.name,
        room: event.room,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
      },
    });
    return result as unknown as Event;
  }

  async findById(id: string): Promise<Event | null> {
    const result = await this.prisma.event.findUnique({
      where: { id },
    });
    return result as Event | null;
  }

  async findByName(name: string): Promise<Event | null> {
    const result = await this.prisma.event.findUnique({
      where: { name },
    });
    return result as Event | null;
  }

  async findByRoom(room: string): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      where: { room },
      orderBy: { startTime: 'asc' },
    });
    return results as Event[];
  }

  async findActiveInTimeRange(
    startTime: Date,
    endTime: Date,
  ): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      where: {
        isActive: true,
        startTime: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: { startTime: 'asc' },
    });
    return results as Event[];
  }

  async findOverlappingEvents(
    room: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      where: {
        room,
        isActive: true,
        AND: [
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
      orderBy: { startTime: 'asc' },
    });
    return results as Event[];
  }

  async findAll(): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      orderBy: { startTime: 'asc' },
    });
    return results as Event[];
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({
      where: { id },
    });
  }

  async update(event: Event): Promise<Event> {
    const result = await this.prisma.event.update({
      where: { id: event.id },
      data: {
        name: event.name,
        room: event.room,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
      },
    });
    return result as unknown as Event;
  }
}
