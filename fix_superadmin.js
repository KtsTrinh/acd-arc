const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('Found:', superAdmins.length);
  for (const u of superAdmins) {
    console.log('SUPER_ADMIN:', u.email);
  }
  const left = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('Remaining:', left.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
