import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verifying database data...\n');

  // Check users
  const users = await prisma.user.findMany();
  console.log(`✅ Users: ${users.length}`);
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.name})`);
  });

  // Check links
  const links = await prisma.link.findMany();
  console.log(`\n✅ Links: ${links.length}`);
  links.forEach(link => {
    console.log(`   - ${link.shortCode} → ${link.originalUrl} (${link.clickCount} clicks)`);
  });

  // Check QR codes
  const qrCodes = await prisma.qRCode.findMany();
  console.log(`\n✅ QR Codes: ${qrCodes.length}`);
  qrCodes.forEach(qr => {
    console.log(`   - Scans: ${qr.scanCount}`);
  });

  // Check events
  const events = await prisma.event.findMany({
    include: {
      ticketTypes: true,
    },
  });
  console.log(`\n✅ Events: ${events.length}`);
  events.forEach(event => {
    console.log(`   - ${event.name} (${event.ticketTypes.length} ticket types)`);
    event.ticketTypes.forEach(tt => {
      console.log(`     • ${tt.name}: ${tt.quantitySold}/${tt.quantityTotal} sold`);
    });
  });

  // Check orders
  const orders = await prisma.order.findMany();
  console.log(`\n✅ Orders: ${orders.length}`);
  orders.forEach(order => {
    console.log(`   - ${order.orderNumber}: ₦${order.totalAmount} (${order.paymentStatus})`);
  });

  // Check tickets
  const tickets = await prisma.ticket.findMany();
  console.log(`\n✅ Tickets: ${tickets.length}`);
  tickets.forEach(ticket => {
    console.log(`   - ${ticket.ticketNumber} (${ticket.status})`);
  });

  console.log('\n✨ Database verification complete!');
}

verifyData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
