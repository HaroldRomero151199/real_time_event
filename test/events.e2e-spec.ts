import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('EventsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/v1/events (POST)', () => {
    it('should create a new event successfully', () => {
      const createEventDto = {
        name: 'Tech Conference 2024',
        room: 'Room 1',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      };

      return request(app.getHttpServer())
        .post('/v1/events')
        .send(createEventDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Tech Conference 2024');
          expect(res.body.room).toBe('Room 1');
          expect(res.body.isActive).toBe(true);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should reject overlapping events in the same room', async () => {
      const event1 = {
        name: 'Overlap Test Event 1',
        room: 'Room 1',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      };

      const event2 = {
        name: 'Overlap Test Event 2',
        room: 'Room 1',
        startTime: '2024-01-15T10:30:00Z',
        endTime: '2024-01-15T12:00:00Z',
      };

      // Create first event
      await request(app.getHttpServer())
        .post('/v1/events')
        .send(event1)
        .expect(201);

      // Try to create overlapping event
      return request(app.getHttpServer())
        .post('/v1/events')
        .send(event2)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('overlaps');
        });
    });

    it('should allow overlapping events in different rooms', async () => {
      const event1 = {
        name: 'Different Room Event 1',
        room: 'Room 1',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      };

      const event2 = {
        name: 'Different Room Event 2',
        room: 'Room 2',
        startTime: '2024-01-15T10:30:00Z',
        endTime: '2024-01-15T12:00:00Z',
      };

      // Create first event
      await request(app.getHttpServer())
        .post('/v1/events')
        .send(event1)
        .expect(201);

      // Create overlapping event in different room
      return request(app.getHttpServer())
        .post('/v1/events')
        .send(event2)
        .expect(201);
    });

    it('should reject events with invalid time range', () => {
      const invalidEvent = {
        name: 'Invalid Time Range Event',
        room: 'Room 1',
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T09:00:00Z',
      };

      return request(app.getHttpServer())
        .post('/v1/events')
        .send(invalidEvent)
        .expect(400);
    });
  });

  describe('/v1/events/query (GET)', () => {
    beforeEach(async () => {
      // Create test events
      const events = [
        {
          name: 'Query Test Event 1',
          room: 'Room 1',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
        },
        {
          name: 'Query Test Event 2',
          room: 'Room 2',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:30:00Z',
        },
      ];

      for (const event of events) {
        await request(app.getHttpServer())
          .post('/v1/events')
          .send(event)
          .expect(201);
      }
    });

    it('should query active events in time range', () => {
      return request(app.getHttpServer())
        .get('/v1/events/query')
        .query({
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T10:45:00Z',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.events).toHaveLength(2);
          expect(res.body.total).toBe(2);
          expect(res.body.queryStartTime).toBe('2024-01-15T10:00:00.000Z');
          expect(res.body.queryEndTime).toBe('2024-01-15T10:45:00.000Z');
        });
    });

    it('should return empty array for time range with no events', () => {
      return request(app.getHttpServer())
        .get('/v1/events/query')
        .query({
          startTime: '2024-01-15T12:00:00Z',
          endTime: '2024-01-15T13:00:00Z',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.events).toHaveLength(0);
          expect(res.body.total).toBe(0);
        });
    });
  });

  describe('/v1/events/:name/cancel (POST)', () => {
    let eventName: string;

    beforeEach(async () => {
      const event = {
        name: 'Event to Cancel',
        room: 'Room 1',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/events')
        .send(event)
        .expect(201);

      eventName = response.body.name;
    });

    it('should cancel an event successfully', () => {
      return request(app.getHttpServer())
        .post(`/v1/events/${eventName}/cancel`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(eventName);
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should return 404 for non-existent event', () => {
      return request(app.getHttpServer())
        .post('/v1/events/NonExistentEvent/cancel')
        .expect(404);
    });
  });

  describe('/v1/events/occupancy-report (GET)', () => {
    beforeEach(async () => {
      // Create test events in different rooms
      const events = [
        {
          name: 'Event A',
          room: 'Room 1',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
        },
        {
          name: 'Event B',
          room: 'Room 1',
          startTime: '2024-01-15T12:00:00Z',
          endTime: '2024-01-15T14:00:00Z',
        },
        {
          name: 'Event C',
          room: 'Room 2',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:30:00Z',
        },
      ];

      for (const event of events) {
        await request(app.getHttpServer())
          .post('/v1/events')
          .send(event)
          .expect(201);
      }
    });

    it('should generate occupancy report', () => {
      return request(app.getHttpServer())
        .get('/v1/events/occupancy-report')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalRooms).toBe(2);
          expect(res.body.totalEvents).toBe(3);
          expect(res.body.totalActiveEvents).toBe(3);
          expect(res.body.rooms).toHaveLength(2);

          const room1 = res.body.rooms.find((r: any) => r.room === 'Room 1');
          const room2 = res.body.rooms.find((r: any) => r.room === 'Room 2');

          expect(room1.totalEvents).toBe(2);
          expect(room1.activeEvents).toBe(2);
          expect(room2.totalEvents).toBe(1);
          expect(room2.activeEvents).toBe(1);
        });
    });
  });
});
