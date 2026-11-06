const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const info = await prisma.$queryRawUnsafe(`SELECT current_database(), inet_server_addr(), inet_server_port(), current_user`);
  console.log("CONNECTION:", JSON.stringify(info));
  try {
    const cols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' ORDER BY ordinal_position`);
    console.log("PRODUCT COLUMNS:", cols.map(r => r.column_name).join(", "));
  } catch (e) { console.error("ERR:", e.message); }
  await prisma.$disconnect();
})();