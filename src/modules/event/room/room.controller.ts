import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Room Management')
@Controller('v1/rooms')
export class RoomController {
  // Room management endpoints will be added here
}
