import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Serverless (Vercel) chạy nhiều lambda instance song song. Prisma mặc định mở
 * `num_cpus * 2 + 1` connection cho mỗi instance, khiến Postgres bị quá tải
 * ("too many connections for role ..."). Giới hạn còn 1 connection/instance và
 * chờ tối đa 30s thay vì lập tức lỗi.
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
