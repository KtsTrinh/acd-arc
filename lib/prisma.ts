import { PrismaClient } from ".prisma/client/default";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

/**
 * Serverless chạy nhiều instance song song. Prisma mặc định mở
 * ~num_cpus*2+1 kết nối/instance, dễ vượt limit của MySQL/PlanetScale
 * -> P2024 "Timed out fetching a new connection from the pool".
 */
function withConnectionLimit(url?: string) {
  if (!url) return undefined;
  if (/connection_limit=/i.test(url)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=1&pool_timeout=60`;
}

const databaseUrl = withConnectionLimit(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
  });

globalForPrisma.prisma = prisma;
