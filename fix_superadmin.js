const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keep = 'trinhhongtu.kts@gmail.com'.toLowerCase();
  const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('Found:', superAdmins.length);
  for (const u of superAdmins) {
    if (u.email && u.email.toLowerCase() !== keep) {
      await prisma.user.update({ where: { id: u.id }, data: { role: 'ADMIN' } });
      console.log('Demoted:', u.email);
    } else if (u.email && u.email.toLowerCase() === keep) {
      console.log('Keep:', u.email);
    }
  }
  const left = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('Remaining:', left.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
