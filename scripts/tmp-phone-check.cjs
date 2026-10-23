const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const u = await p.user.findMany({ select: { email: true, phone: true, phoneVerified: true } });
  console.log(JSON.stringify(u));
  await p.$disconnect();
})();
