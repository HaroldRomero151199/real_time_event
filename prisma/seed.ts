// Seeder for Room and Event tables with UUIDs for PostgreSQL
// Run with: npx prisma db seed
// This script creates sample rooms and events for development/testing

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.event.deleteMany();
  await prisma.room.deleteMany();

  // Create rooms with valid UUIDs
  const room1 = await prisma.room.create({
    data: {
      id: 'b7e6a1e2-1c2d-4e3a-9f1a-1234567890ab',
      name: 'Room 1',
      capacity: 100,
    },
  });
  console.log('✅ Created Room 1:', room1.id);

  const room2 = await prisma.room.create({
    data: {
      id: 'c8f7b2f3-2d3e-4f4b-8a2b-2345678901bc',
      name: 'Room 2',
      capacity: 80,
    },
  });
  console.log('✅ Created Room 2:', room2.id);

  const room3 = await prisma.room.create({
    data: {
      id: 'd9a8c3a4-3e4f-4a5c-9a3c-3456789012cd',
      name: 'Room 3',
      capacity: 50,
    },
  });
  console.log('✅ Created Room 3:', room3.id);

  // Create events with future dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const eventA = await prisma.event.create({
    data: {
      name: 'Event A',
      roomId: room1.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hours
    },
  });
  console.log('✅ Created Event A:', eventA.id);

  // Event B - overlapping with Event A (for testing business logic)
  const eventB = await prisma.event.create({
    data: {
      name: 'Event B',
      roomId: room1.id,
      startTime: new Date(tomorrow.getTime() + 1.5 * 60 * 60 * 1000), // +1.5 hours
      endTime: new Date(tomorrow.getTime() + 3.5 * 60 * 60 * 1000), // +3.5 hours
    },
  });
  console.log('✅ Created Event B (overlapping):', eventB.id);

  // Event C - in different room, overlapping time but different room
  const eventC = await prisma.event.create({
    data: {
      name: 'Event C',
      roomId: room2.id,
      startTime: new Date(tomorrow.getTime() + 1 * 60 * 60 * 1000), // +1 hour
      endTime: new Date(tomorrow.getTime() + 2.5 * 60 * 60 * 1000), // +2.5 hours
    },
  });
  console.log('✅ Created Event C (different room):', eventC.id);

  // Event D - in Room 3, no overlap
  const eventD = await prisma.event.create({
    data: {
      name: 'Event D',
      roomId: room3.id,
      startTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // +4 hours
      endTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000), // +6 hours
    },
  });
  console.log('✅ Created Event D:', eventD.id);

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - Rooms created: 3`);
  console.log(`   - Events created: 4`);
  console.log(`   - Room 1: 2 events (with overlap for testing)`);
  console.log(`   - Room 2: 1 event`);
  console.log(`   - Room 3: 1 event`);
  console.log('🔑 Valid Room IDs for testing:');
  console.log(`   - Room 1: ${room1.id}`);
  console.log(`   - Room 2: ${room2.id}`);
  console.log(`   - Room 3: ${room3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
