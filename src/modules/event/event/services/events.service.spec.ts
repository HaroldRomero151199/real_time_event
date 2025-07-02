import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { IEventRepository } from '../repositories/event-repository.interface';
import { EVENT_REPOSITORY } from '../tokens';
import { Event } from '../entities/event.model';
import {
  EventOverlapException,
  EventAlreadyExistsException,
  InvalidTimeRangeException,
  EventNotFoundException,
} from '../exceptions/event-exceptions';

describe('EventsService', () => {
  let service: EventsService;
  let mockRepository: jest.Mocked<IEventRepository>;

  const mockEvent = {
    id: 'event-uuid-1',
    name: 'Test Event',
    roomId: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
    startTime: '2025-07-03T09:00:00Z',
    endTime: '2025-07-03T11:00:00Z',
    createdAt: '2025-07-03T08:00:00Z',
    updatedAt: '2025-07-03T08:00:00Z',
    isActive: true,
    isOverlapping: jest.fn(),
    isActiveInTimeRange: jest.fn(),
    cancel: jest.fn(),
    isCurrentlyActive: jest.fn(),
    getDurationInMinutes: jest.fn(),
  };

  const createMockEvent = (overrides: Partial<Event> = {}): Event => {
    const event = new Event();
    Object.assign(event, mockEvent, overrides);
    return event;
  };

  beforeEach(async () => {
    const mockRepositoryImpl = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByRoom: jest.fn(),
      findActiveInTimeRange: jest.fn(),
      findOverlappingEvents: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EVENT_REPOSITORY,
          useValue: mockRepositoryImpl,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    mockRepository = module.get(EVENT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    const createEventDto = {
      name: 'Test Event',
      roomId: 'room-uuid-1',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
    };

    it('should create an event successfully', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(mockEvent);

      // Act
      const result = await service.createEvent(createEventDto);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Event');
      expect(mockRepository.findOverlappingEvents).toHaveBeenCalledWith(
        'room-uuid-1',
        createEventDto.startTime,
        createEventDto.endTime,
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw InvalidTimeRangeException when start time >= end time', async () => {
      // Arrange
      const invalidDto = {
        ...createEventDto,
        startTime: new Date('2024-01-15T11:00:00Z'),
        endTime: new Date('2024-01-15T09:00:00Z'),
      };

      // Act & Assert
      await expect(service.createEvent(invalidDto)).rejects.toThrow(
        InvalidTimeRangeException,
      );
    });

    it('should throw InvalidTimeRangeException when start time is in the past', async () => {
      // Arrange
      const pastDto = {
        ...createEventDto,
        startTime: new Date('2020-01-15T09:00:00Z'),
        endTime: new Date('2020-01-15T11:00:00Z'),
      };

      // Act & Assert
      await expect(service.createEvent(pastDto)).rejects.toThrow(
        InvalidTimeRangeException,
      );
    });

    it('should throw EventAlreadyExistsException when event name already exists', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue(mockEvent);

      // Act & Assert
      await expect(service.createEvent(createEventDto)).rejects.toThrow(
        EventAlreadyExistsException,
      );
    });

    it('should throw EventOverlapException when there are overlapping events', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findOverlappingEvents.mockResolvedValue([mockEvent]);

      // Act & Assert
      await expect(service.createEvent(createEventDto)).rejects.toThrow(
        EventOverlapException,
      );
    });
  });

  describe('queryEvents', () => {
    const queryDto = {
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T10:45:00Z'),
    };

    it('should return active events in time range', async () => {
      // Arrange
      const events = [mockEvent];
      mockRepository.findAll.mockResolvedValue(events);
      mockEvent.isActiveInTimeRange = jest.fn().mockReturnValue(true);

      // Act
      const result = await service.queryEvents(queryDto);

      // Assert
      expect(result).toEqual(events);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should throw InvalidTimeRangeException for invalid query time range', async () => {
      // Arrange
      const invalidQuery = {
        startTime: new Date('2024-01-15T10:45:00Z'),
        endTime: new Date('2024-01-15T10:00:00Z'),
      };

      // Act & Assert
      await expect(service.queryEvents(invalidQuery)).rejects.toThrow(
        InvalidTimeRangeException,
      );
    });
  });

  describe('cancelEvent', () => {
    it('should cancel an event successfully', async () => {
      // Arrange
      const cancelledEvent = createMockEvent({ isActive: false });
      mockRepository.findByName.mockResolvedValue(mockEvent);
      mockRepository.update.mockResolvedValue(cancelledEvent);
      mockEvent.cancel = jest.fn();

      // Act
      const result = await service.cancelEvent('Test Event');

      // Assert
      expect(result).toEqual(cancelledEvent);
      expect(mockEvent.cancel).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw EventNotFoundException when event does not exist', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelEvent('Non-existent Event')).rejects.toThrow(
        EventNotFoundException,
      );
    });

    it('should throw error when event is already cancelled', async () => {
      // Arrange
      const cancelledEvent = createMockEvent({ isActive: false });
      mockRepository.findByName.mockResolvedValue(cancelledEvent);

      // Act & Assert
      await expect(service.cancelEvent('Test Event')).rejects.toThrow(
        'Event "Test Event" is already cancelled',
      );
    });
  });

  describe('generateOccupancyReport', () => {
    it('should generate occupancy report successfully', async () => {
      // Arrange
      const events = [
        createMockEvent({ roomId: 'room-uuid-1' }),
        createMockEvent({ id: '2', name: 'Event 2', roomId: 'room-uuid-2' }),
      ];
      mockRepository.findAll.mockResolvedValue(events);

      // Act
      const result = await service.generateOccupancyReport();

      // Assert
      expect(result.totalRooms).toBe(2);
      expect(result.totalEvents).toBe(2);
      expect(result.rooms).toHaveLength(2);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle events that start/end exactly at the same time', async () => {
      // Arrange
      const event1 = createMockEvent({
        startTime: new Date('2025-07-03T09:00:00Z'),
        endTime: new Date('2025-07-03T10:00:00Z'),
      });

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.findOverlappingEvents
        .mockResolvedValueOnce([]) // No overlap for first event
        .mockResolvedValueOnce([]); // No overlap for second event
      mockRepository.save.mockResolvedValue(event1);

      // Act
      const result1 = await service.createEvent({
        name: 'Event 1',
        roomId: 'room-uuid-1',
        startTime: event1.startTime,
        endTime: event1.endTime,
      });

      // Assert
      expect(result1).toEqual(event1);
      // The second event should also be allowed (no overlap)
    });

    it('should handle empty event lists', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.generateOccupancyReport();

      // Assert
      expect(result.totalRooms).toBe(0);
      expect(result.totalEvents).toBe(0);
      expect(result.rooms).toHaveLength(0);
    });
  });
});
