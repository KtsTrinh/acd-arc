const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const product = await p.product.create({ data: { name: "test product", slug: "test-product-xyz" } });
    console.log("created", product.id);
    const found = await p.product.findUnique({ where: { id: product.id }, include: { gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } }, tags: { include: { tag: true } } } });
    console.log("found", found.id);
    await p.product.delete({ where: { id: product.id } });
  } catch (e) { console.error(e); }
  await p.();
})();
