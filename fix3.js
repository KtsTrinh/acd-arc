const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const keep = 'trinhhongtu.kts@gmail.com';
  const users = await p.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  for (const u of users) {
    if (u.email.toLowerCase() !== keep.toLowerCase()) {
      await p.user.update({ where: { id: u.id }, data: { role: 'ADMIN' } });
      console.log('demoted');
    }
  }
  const left = await p.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  console.log(left.length);
  await p.();
})();
