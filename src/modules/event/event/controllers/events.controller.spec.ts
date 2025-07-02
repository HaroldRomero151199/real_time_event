import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';
import { EventResponseDto } from '../dtos/event-response.dto';
import { EventsQueryResponseDto } from '../dtos/event-response.dto';
import { OccupancyReportResponseDto } from '../dtos/event-response.dto';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEvent = {
    id: 'event-uuid-1',
    name: 'Test Event',
    roomId: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
    startTime: '2025-07-03T09:00:00Z',
    endTime: '2025-07-03T11:00:00Z',
    createdAt: '2025-07-03T08:00:00Z',
    updatedAt: '2025-07-03T08:00:00Z',
    isActive: true,
  };

  const mockEventsService = {
    createEvent: jest.fn(),
    queryEvents: jest.fn(),
    cancelEvent: jest.fn(),
    generateOccupancyReport: jest.fn(),
    getCurrentlyActiveEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      // Arrange
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        roomId: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
        startTime: '2025-07-03T09:00:00Z',
        endTime: '2025-07-03T11:00:00Z',
      };

      mockEventsService.createEvent.mockResolvedValue(mockEvent);

      // Act
      const result = await controller.createEvent(createEventDto);

      // Assert
      expect(service.createEvent).toHaveBeenCalledWith(createEventDto);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('queryEvents', () => {
    it('should query events in time range successfully', async () => {
      // Arrange
      const queryDto: QueryEventsDto = {
        startTime: '2025-07-03T10:00:00Z',
        endTime: '2025-07-03T10:45:00Z',
      };

      const mockQueryResponse: EventsQueryResponseDto = {
        events: [mockEvent],
        total: 1,
        queryStartTime: queryDto.startTime,
        queryEndTime: queryDto.endTime,
      };

      mockEventsService.queryEvents.mockResolvedValue([mockEvent]);

      // Act
      const result = await controller.queryEvents(queryDto);

      // Assert
      expect(service.queryEvents).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockQueryResponse);
    });
  });

  describe('cancelEvent', () => {
    it('should cancel an event successfully', async () => {
      // Arrange
      const eventName = 'Test Event';
      const cancelledEvent = { ...mockEvent, isActive: false };
      mockEventsService.cancelEvent.mockResolvedValue(cancelledEvent);

      // Act
      const result = await controller.cancelEvent(eventName);

      // Assert
      expect(service.cancelEvent).toHaveBeenCalledWith(eventName);
      expect(result).toEqual(cancelledEvent);
    });
  });

  describe('generateOccupancyReport', () => {
    it('should generate occupancy report successfully', async () => {
      // Arrange
      const mockReport: OccupancyReportResponseDto = {
        totalRooms: 2,
        totalEvents: 3,
        totalActiveEvents: 2,
        rooms: [
          {
            roomId: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
            roomName: 'Room 1',
            events: [mockEvent],
            totalEvents: 1,
            activeEvents: 1,
            currentlyActiveEvents: 0,
          },
        ],
        generatedAt: '2025-07-03T08:00:00Z',
      };

      mockEventsService.generateOccupancyReport.mockResolvedValue(mockReport);

      // Act
      const result = await controller.generateOccupancyReport();

      // Assert
      expect(service.generateOccupancyReport).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });
  });
}); 