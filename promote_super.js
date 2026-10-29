const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node promote_super.js <email>');
    process.exit(1);
  }
  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  if (!user) {
    console.log('Not found');
    return;
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPER_ADMIN' } });
  console.log('Updated to SUPER_ADMIN');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
