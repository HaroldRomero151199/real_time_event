import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class EventValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log incoming requests
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

    // Basic request validation
    if (req.method === 'POST' && req.path.includes('/events')) {
      this.validateEventRequest(req);
    }

    next();
  }

  private validateEventRequest(req: Request): void {
    const { name, room, startTime, endTime } = req.body as {
      name?: string;
      room?: string;
      startTime?: string;
      endTime?: string;
    };

    // Check required fields
    if (!name || !room || !startTime || !endTime) {
      throw new HttpException(
        'Missing required fields: name, room, startTime, endTime',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException(
        'Invalid date format for startTime or endTime',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (start >= end) {
      throw new HttpException(
        'Start time must be before end time',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
