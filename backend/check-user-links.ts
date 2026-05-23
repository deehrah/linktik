import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserLinks() {
  console.log('🔍 Checking user and links in database...\n');

  // Get the test user
  const user = await prisma.user.findUnique({
    where: { email: 'test@linktik.ng' },
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log('✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);

  // Get links for this user
  const links = await prisma.link.findMany({
    where: { userId: user.id },
  });

  console.log('\n📎 Links for this user:', links.length);
  links.forEach(link => {
    console.log(`   - ${link.shortCode} (userId: ${link.userId})`);
  });

  // Get ALL links in database
  const allLinks = await prisma.link.findMany();
  console.log('\n📎 Total links in database:', allLinks.length);
  allLinks.forEach(link => {
    console.log(`   - ${link.shortCode} (userId: ${link.userId})`);
  });

  // Check if user IDs match
  if (links.length === 0 && allLinks.length > 0) {
    console.log('\n⚠️  WARNING: User has no links, but links exist in database!');
    console.log('   This means the userId in links table doesn\'t match the user ID');
    console.log('   User ID:', user.id);
    console.log('   Link user IDs:', allLinks.map(l => l.userId));
  }

  await prisma.$disconnect();
}

checkUserLinks().catch(console.error);
