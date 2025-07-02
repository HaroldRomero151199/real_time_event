import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { RoomService } from './room.service';
import { ResponseWrapperDto } from '../../../common/dtos/response-wrapper.dto';

@ApiTags('Rooms Management')
@Controller('v1/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all rooms',
    description: 'Retrieve all available rooms in the convention center',
  })
  @ApiResponse({
    status: 200,
    description: 'Rooms retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseWrapperDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
                  },
                  name: { type: 'string', example: 'Room 1' },
                  capacity: { type: 'number', example: 100 },
                  isActive: { type: 'boolean', example: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      ],
    },
  })
  async getAllRooms() {
    return this.roomService.getAllRooms();
  }
}
