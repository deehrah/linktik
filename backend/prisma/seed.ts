import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (in reverse order of dependencies)
  await prisma.entryLog.deleteMany();
  await prisma.scanner.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.analyticsScan.deleteMany();
  await prisma.analyticsClick.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.link.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@linktik.ng',
      name: 'Test User',
      passwordHash: '$2b$12$5ZI26qp0doOHmrmUEsx8pOGVkKgq6UOSaF7T101OHt6mpUcf16xRG', // password: password123
      emailVerified: true,
      planTier: 'PRO',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample links
  const link1 = await prisma.link.create({
    data: {
      userId: user.id,
      shortCode: 'summer-sale',
      originalUrl: 'https://example.com/summer-sale-2024',
      title: 'Summer Sale',
      clickCount: 42,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      userId: user.id,
      shortCode: 'promo-code',
      originalUrl: 'https://example.com/promos',
      title: 'Promo Codes',
      clickCount: 23,
    },
  });

  console.log('✅ Created sample links');

  // Create QR codes
  await prisma.qRCode.create({
    data: {
      userId: user.id,
      linkId: link1.id,
      data: link1.originalUrl,
      scanCount: 15,
    },
  });

  console.log('✅ Created sample QR codes');

  // Create sample event
  const event = await prisma.event.create({
    data: {
      organizerId: user.id,
      name: 'Afrobeats Night Lagos',
      slug: 'afrobeats-lagos',
      description: 'The biggest afrobeats concert of the year',
      dateTime: new Date('2024-06-15T20:00:00'),
      venueName: 'Eko Hotel',
      venueAddress: 'Victoria Island, Lagos',
      category: 'Concert',
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 1000,
    },
  });

  console.log('✅ Created sample event:', event.name);

  // Create ticket types
  const ticketType1 = await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name: 'Regular',
      description: 'General admission',
      price: 5000,
      quantityTotal: 600,
      quantitySold: 347,
      quantityLeft: 253,
    },
  });

  const ticketType2 = await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name: 'VIP',
      description: 'Reserved seating + free drinks',
      price: 15000,
      quantityTotal: 100,
      quantitySold: 32,
      quantityLeft: 68,
    },
  });

  console.log('✅ Created ticket types');

  // Create sample order and tickets
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001234',
      eventId: event.id,
      customerName: 'Chidi Okafor',
      customerEmail: 'chidi@example.com',
      customerPhone: '+2348012345678',
      totalAmount: 10000,
      serviceCharge: 700,
      ticketCount: 2,
      paymentStatus: 'SUCCESSFUL',
      status: 'CONFIRMED',
      paymentMethod: 'paystack',
      paymentReference: 'ref_1234567890',
    },
  });

  // Create tickets
  await prisma.ticket.create({
    data: {
      orderId: order.id,
      eventId: event.id,
      ticketTypeId: ticketType1.id,
      ticketNumber: 'TKT-001001',
      buyerName: 'Chidi Okafor',
      buyerEmail: 'chidi@example.com',
      qrCodeData: 'TKT:evt_' + event.id + ':TKT-001001:abc123def456',
      status: 'VALID',
    },
  });

  await prisma.ticket.create({
    data: {
      orderId: order.id,
      eventId: event.id,
      ticketTypeId: ticketType1.id,
      ticketNumber: 'TKT-001002',
      buyerName: 'Chidi Okafor',
      buyerEmail: 'chidi@example.com',
      qrCodeData: 'TKT:evt_' + event.id + ':TKT-001002:xyz789uvw012',
      status: 'VALID',
    },
  });

  console.log('✅ Created sample order with tickets');

  // Create scanner
  await prisma.scanner.create({
    data: {
      eventId: event.id,
      name: 'Gate 1',
      code: 'SCANNER-001',
      passwordHash: '$2b$12$IQv3rhs/ol/eJZQrTSQNeu4kXewTu7o4U9n7QfMKl3WDTXMiBzg3a',
    },
  });

  console.log('✅ Created sample scanner');

  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
