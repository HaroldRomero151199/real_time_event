import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { IEventRepository } from '../repositories/event-repository.interface';
import { EVENT_REPOSITORY } from '../tokens';
import { Event } from '../entities/event.entity';
import {
  EventOverlapException,
  InvalidTimeRangeException,
  EventNotFoundException,
  PastEventException,
} from '../exceptions/event-exceptions';
import { CreateEventDto } from '../dtos/create-event.dto';
import { QueryEventsDto } from '../dtos/query-events.dto';

describe('EventsService', () => {
  let service: EventsService;
  let mockRepository: jest.Mocked<IEventRepository>;

  const mockEventData = {
    id: 'event-uuid-1',
    name: 'Test Event',
    roomId: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
    startTime: new Date('2025-07-03T09:00:00Z'),
    endTime: new Date('2025-07-03T11:00:00Z'),
    createdAt: new Date('2025-07-03T08:00:00Z'),
    updatedAt: new Date('2025-07-03T08:00:00Z'),
    isActive: true,
  };

  const createMockEvent = (overrides: Partial<Event> = {}): Event => {
    const event = new Event();
    Object.assign(event, mockEventData, overrides);
    
    // Mock methods
    event.isOverlapping = jest.fn();
    event.isActiveInTimeRange = jest.fn().mockReturnValue(true);
    event.cancel = jest.fn().mockImplementation(() => {
      event.isActive = false;
    });
    event.isCurrentlyActive = jest.fn().mockReturnValue(false);
    event.getDurationInMinutes = jest.fn().mockReturnValue(120);
    
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const futureDateEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);
    
    const createEventDto: CreateEventDto = {
      name: 'Test Event',
      roomId: 'room-uuid-1',
      startTime: futureDate.toISOString(),
      endTime: futureDateEnd.toISOString(),
    };

    it('should create an event successfully', async () => {
      // Arrange
      const expectedEvent = createMockEvent({
        name: createEventDto.name,
        roomId: createEventDto.roomId,
        startTime: new Date(createEventDto.startTime),
        endTime: new Date(createEventDto.endTime),
      });

      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(createEventDto);

      // Assert
      expect(result).toEqual(expectedEvent);
      expect(mockRepository.findOverlappingEvents).toHaveBeenCalledWith(
        createEventDto.roomId,
        new Date(createEventDto.startTime),
        new Date(createEventDto.endTime),
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw InvalidTimeRangeException when start time >= end time', async () => {
      // Arrange
      const invalidDto: CreateEventDto = {
        ...createEventDto,
        startTime: '2025-01-15T11:00:00Z',
        endTime: '2025-01-15T09:00:00Z',
      };

      // Act & Assert
      await expect(service.createEvent(invalidDto)).rejects.toThrow(
        InvalidTimeRangeException,
      );
      expect(mockRepository.findOverlappingEvents).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw PastEventException when start time is in the past', async () => {
      // Arrange
      const pastDto: CreateEventDto = {
        ...createEventDto,
        startTime: '2020-01-15T09:00:00Z',
        endTime: '2020-01-15T11:00:00Z',
      };

      // Act & Assert
      await expect(service.createEvent(pastDto)).rejects.toThrow(
        PastEventException,
      );
      expect(mockRepository.findOverlappingEvents).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw EventOverlapException when there are overlapping events', async () => {
      // Arrange
      const overlappingEvent = createMockEvent();
      mockRepository.findOverlappingEvents.mockResolvedValue([overlappingEvent]);

      // Act & Assert
      await expect(service.createEvent(createEventDto)).rejects.toThrow(
        EventOverlapException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should trim event name before saving', async () => {
      // Arrange
      const dtoWithSpaces: CreateEventDto = {
        ...createEventDto,
        name: '  Test Event  ',
      };
      
      const expectedEvent = createMockEvent({ name: 'Test Event' });
      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(expectedEvent);

      // Act
      await service.createEvent(dtoWithSpaces);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Event',
        }),
      );
    });
  });

  describe('queryEvents', () => {
    const queryDto: QueryEventsDto = {
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:45:00Z',
    };

    it('should return active events in time range', async () => {
      // Arrange
      const event1 = createMockEvent({ name: 'Event 1' });
      const event2 = createMockEvent({ name: 'Event 2' });
      
      event1.isActiveInTimeRange = jest.fn().mockReturnValue(true);
      event2.isActiveInTimeRange = jest.fn().mockReturnValue(false);
      
      mockRepository.findAll.mockResolvedValue([event1, event2]);

      // Act
      const result = await service.queryEvents(queryDto);

      // Assert
      expect(result).toEqual([event1]);
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(event1.isActiveInTimeRange).toHaveBeenCalledWith(
        new Date(queryDto.startTime),
        new Date(queryDto.endTime),
      );
      expect(event2.isActiveInTimeRange).toHaveBeenCalledWith(
        new Date(queryDto.startTime),
        new Date(queryDto.endTime),
      );
    });

    it('should throw InvalidTimeRangeException for invalid query time range', async () => {
      // Arrange
      const invalidQuery: QueryEventsDto = {
        startTime: '2025-01-15T10:45:00Z',
        endTime: '2025-01-15T10:00:00Z',
      };

      // Act & Assert
      await expect(service.queryEvents(invalidQuery)).rejects.toThrow(
        InvalidTimeRangeException,
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no events are in time range', async () => {
      // Arrange
      const event1 = createMockEvent();
      event1.isActiveInTimeRange = jest.fn().mockReturnValue(false);
      
      mockRepository.findAll.mockResolvedValue([event1]);

      // Act
      const result = await service.queryEvents(queryDto);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('cancelEvent', () => {
    it('should cancel an event successfully', async () => {
      // Arrange
      const activeEvent = createMockEvent({ isActive: true });
      const cancelledEvent = createMockEvent({ isActive: false });
      
      mockRepository.findByName.mockResolvedValue(activeEvent);
      mockRepository.update.mockResolvedValue(cancelledEvent);

      // Act
      const result = await service.cancelEvent('Test Event');

      // Assert
      expect(result).toEqual(cancelledEvent);
      expect(activeEvent.cancel).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should throw EventNotFoundException when event does not exist', async () => {
      // Arrange
      mockRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelEvent('Non-existent Event')).rejects.toThrow(
        EventNotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when event is already cancelled', async () => {
      // Arrange
      const cancelledEvent = createMockEvent({ isActive: false });
      mockRepository.findByName.mockResolvedValue(cancelledEvent);

      // Act & Assert
      await expect(service.cancelEvent('Test Event')).rejects.toThrow(
        'Event "Test Event" is already cancelled',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('generateOccupancyReport', () => {
    it('should generate occupancy report successfully', async () => {
      // Arrange
      const event1 = createMockEvent({ 
        roomId: 'room-uuid-1',
        name: 'Event 1',
        isActive: true,
      });
      const event2 = createMockEvent({ 
        id: 'event-uuid-2',
        name: 'Event 2',
        roomId: 'room-uuid-2',
        isActive: true,
      });
      const event3 = createMockEvent({ 
        id: 'event-uuid-3',
        name: 'Event 3',
        roomId: 'room-uuid-1',
        isActive: false,
      });

      event1.isCurrentlyActive = jest.fn().mockReturnValue(true);
      event2.isCurrentlyActive = jest.fn().mockReturnValue(false);
      event3.isCurrentlyActive = jest.fn().mockReturnValue(false);

      mockRepository.findAll.mockResolvedValue([event1, event2, event3]);

      // Act
      const result = await service.generateOccupancyReport();

      // Assert
      expect(result.totalRooms).toBe(2);
      expect(result.totalEvents).toBe(3);
      expect(result.activeEvents).toBe(2);
      expect(result.currentlyActiveEvents).toBe(1);
      expect(result.rooms).toHaveLength(2);
      expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // Check room details
      const room1 = result.rooms.find(r => r.roomId === 'room-uuid-1');
      expect(room1).toBeDefined();
      expect(room1!.totalEvents).toBe(2);
      expect(room1!.activeEvents).toBe(1);
      expect(room1!.currentlyActiveEvents).toBe(1);
      
      const room2 = result.rooms.find(r => r.roomId === 'room-uuid-2');
      expect(room2).toBeDefined();
      expect(room2!.totalEvents).toBe(1);
      expect(room2!.activeEvents).toBe(1);
      expect(room2!.currentlyActiveEvents).toBe(0);
    });

    it('should handle empty event lists', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.generateOccupancyReport();

      // Assert
      expect(result.totalRooms).toBe(0);
      expect(result.totalEvents).toBe(0);
      expect(result.activeEvents).toBe(0);
      expect(result.currentlyActiveEvents).toBe(0);
      expect(result.rooms).toHaveLength(0);
      expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should group events by room correctly', async () => {
      // Arrange
      const events = [
        createMockEvent({ roomId: 'room-A', name: 'Event A1' }),
        createMockEvent({ id: '2', roomId: 'room-A', name: 'Event A2' }),
        createMockEvent({ id: '3', roomId: 'room-B', name: 'Event B1' }),
      ];
      
      mockRepository.findAll.mockResolvedValue(events);

      // Act
      const result = await service.generateOccupancyReport();

      // Assert
      expect(result.totalRooms).toBe(2);
      expect(result.rooms).toHaveLength(2);
      
      const roomA = result.rooms.find(r => r.roomId === 'room-A');
      const roomB = result.rooms.find(r => r.roomId === 'room-B');
      
      expect(roomA!.totalEvents).toBe(2);
      expect(roomB!.totalEvents).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle events that start/end exactly at the same time', async () => {
      // Arrange
      const startTime = '2025-07-03T09:00:00Z';
      const endTime = '2025-07-03T10:00:00Z';
      
      const createEventDto: CreateEventDto = {
        name: 'Event 1',
        roomId: 'room-uuid-1',
        startTime: startTime,
        endTime: endTime,
      };

      const expectedEvent = createMockEvent({
        name: 'Event 1',
        roomId: 'room-uuid-1',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(createEventDto);

      // Assert
      expect(result).toEqual(expectedEvent);
      expect(mockRepository.findOverlappingEvents).toHaveBeenCalledWith(
        'room-uuid-1',
        new Date(startTime),
        new Date(endTime),
      );
    });

    it('should handle very short events (1 minute)', async () => {
      // Arrange
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 minute later
      
      const createEventDto: CreateEventDto = {
        name: 'Short Event',
        roomId: 'room-uuid-1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const expectedEvent = createMockEvent({
        ...createEventDto,
        startTime: startTime,
        endTime: endTime,
      });
      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(createEventDto);

      // Assert
      expect(result).toEqual(expectedEvent);
    });

    it('should handle events spanning multiple days', async () => {
      // Arrange
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 48 * 60 * 60 * 1000); // 2 days later
      
      const createEventDto: CreateEventDto = {
        name: 'Long Event',
        roomId: 'room-uuid-1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const expectedEvent = createMockEvent({
        ...createEventDto,
        startTime: startTime,
        endTime: endTime,
      });
      mockRepository.findOverlappingEvents.mockResolvedValue([]);
      mockRepository.save.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(createEventDto);

      // Assert
      expect(result).toEqual(expectedEvent);
    });
  });
});
