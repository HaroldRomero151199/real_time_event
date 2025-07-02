// Events repository implementation with UUID support and Room relations
// Handles database operations for events using Prisma ORM
// Uses roomId (UUID) to reference Room entities

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '../entities/event.model';
import { IEventRepository } from './event-repository.interface';
import { Event as PrismaEvent, Room } from '@prisma/client';

@Injectable()
export class EventPrismaRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: Event): Promise<Event> {
    const result = await this.prisma.event.create({
      data: {
        name: event.name,
        roomId: event.roomId,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
      },
      include: {
        room: true,
      },
    });
    return this.mapToEventModel(result);
  }

  async findById(id: string): Promise<Event | null> {
    const result = await this.prisma.event.findUnique({
      where: { id },
    });
    return result ? this.mapToEventModel(result) : null;
  }

  async findByName(name: string): Promise<Event | null> {
    const result = await this.prisma.event.findUnique({
      where: { name },
      include: {
        room: true,
      },
    });
    return result ? this.mapToEventModel(result) : null;
  }

  async findByRoom(roomId: string): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      where: {
        roomId: roomId,
        isActive: true,
      },
      include: {
        room: true,
      },
      orderBy: { startTime: 'asc' },
    });
    return results.map((event) => this.mapToEventModel(event));
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
    return results.map((event) => this.mapToEventModel(event));
  }

  async findOverlappingEvents(
    roomId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      where: {
        roomId: roomId,
        isActive: true,
        AND: [
          {
            OR: [
              {
                startTime: {
                  gte: startTime,
                  lt: endTime,
                },
              },
              {
                endTime: {
                  gt: startTime,
                  lte: endTime,
                },
              },
              {
                startTime: {
                  lte: startTime,
                },
                endTime: {
                  gte: endTime,
                },
              },
            ],
          },
        ],
      },
      include: {
        room: true,
      },
    });
    return results.map((event) => this.mapToEventModel(event));
  }

  async findAll(): Promise<Event[]> {
    const results = await this.prisma.event.findMany({
      include: {
        room: true,
      },
      orderBy: { startTime: 'asc' },
    });
    return results.map((event) => this.mapToEventModel(event));
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
        roomId: event.roomId,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
        updatedAt: new Date(),
      },
      include: {
        room: true,
      },
    });
    return this.mapToEventModel(result);
  }

  private mapToEventModel(eventData: PrismaEvent & { room?: Room }): Event {
    const event = new Event();
    event.id = eventData.id;
    event.name = eventData.name;
    event.roomId = eventData.roomId;
    event.room = eventData.room;
    event.startTime = eventData.startTime;
    event.endTime = eventData.endTime;
    event.isActive = eventData.isActive;
    event.createdAt = eventData.createdAt;
    event.updatedAt = eventData.updatedAt;
    return event;
  }
}
