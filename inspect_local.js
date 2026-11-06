const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  // Replicate the exact GET logic from route.ts
  try {
    const where = {};
    where.active = true;
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    console.log("OK, count:", products.length);
  } catch (error) {
    console.error("ERROR:", error.message);
    console.error("CODE:", error.code);
    console.error("META:", JSON.stringify(error.meta));
  }
  await prisma.$disconnect();
})();