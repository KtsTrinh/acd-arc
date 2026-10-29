const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keep = 'trinhhongtu.kts@gmail.com'.toLowerCase();
  const users = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  for (const u of users) {
    if (!u.email || u.email.toLowerCase() !== keep) {
      await prisma.user.update({ where: { id: u.id }, data: { role: 'ADMIN' } });
      console.log('demoted', u.email);
    }
  }
  const left = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('left', left.length, left.map(x => x.email));
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
