import { Injectable } from '@nestjs/common';
import { PrismaService } from '../event/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllRooms() {
    // Get all rooms directly from the rooms table
    return this.prismaService.room.findMany();
  }
}
