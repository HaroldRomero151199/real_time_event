import * as request from 'supertest';

describe('EventsController (e2e)', () => {
  const baseURL = 'http://localhost:3000';

  describe('/v1/events (POST)', () => {
    it('should create a new event successfully', () => {
      const validRoomId = 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab';
      const baseDate = new Date('2030-12-25T15:00:00Z');
      const isoStart = baseDate.toISOString();
      const isoEnd = new Date(
        baseDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      const createEventDto = {
        name: `Test Event ${Date.now()}-${Math.random().toString(36).substring(7)}`,
        roomId: validRoomId,
        startTime: isoStart,
        endTime: isoEnd,
      };

      return request(baseURL)
        .post('/v1/events')
        .send(createEventDto)
        .expect(201)
        .expect((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.meta.success).toBe(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.data.name).toBe(createEventDto.name);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.data.roomId).toBe(validRoomId);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.data.isActive).toBe(true);
        });
    });

    it('should query active events', () => {
      return request(baseURL)
        .get('/v1/events/currently-active')
        .expect(200)
        .expect((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.meta.success).toBe(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should generate occupancy report', () => {
      return request(baseURL)
        .get('/v1/events/occupancy-report')
        .expect(200)
        .expect((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.meta.success).toBe(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.data.totalRooms).toBeGreaterThanOrEqual(0);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.data.totalEvents).toBeGreaterThanOrEqual(0);
        });
    });

    it('should reject invalid time range', () => {
      const validRoomId = 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab';
      const baseDate = new Date('2025-07-03T09:00:00Z');
      const isoStart = baseDate.toISOString();
      const isoEnd = new Date(
        baseDate.getTime() + 2 * 60 * 60 * 1000,
      ).toISOString();

      const invalidEvent = {
        name: `Invalid Event ${Date.now()}`,
        roomId: validRoomId,
        startTime: isoEnd, // End before start
        endTime: isoStart,
      };

      return request(baseURL)
        .post('/v1/events')
        .send(invalidEvent)
        .expect(400);
    });
  });
});
