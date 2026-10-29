const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keep = 'trinhhongtu.kts@gmail.com'.toLowerCase();
  // Ensure the account exists and is SUPER_ADMIN
  let user = await prisma.user.findFirst({ where: { email: { equals: keep, mode: 'insensitive' } } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Trinh Hong Tu',
        email: 'trinhhongtu.kts@gmail.com',
        role: 'SUPER_ADMIN',
        provider: 'local',
        passwordHash: null,
      }
    });
    console.log('created');
  } else {
    if (user.role !== 'SUPER_ADMIN') {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPER_ADMIN' } });
      console.log('promoted');
    } else {
      console.log('already');
    }
  }
  // Demote others
  const others = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  for (const u of others) {
    if (u.email && u.email.toLowerCase() !== keep) {
      await prisma.user.update({ where: { id: u.id }, data: { role: 'ADMIN' } });
      console.log('demoted', u.email);
    }
  }
  const left = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log('left', left.map(x => x.email));
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
