#!/usr/bin/env node
/**
 * Kéo nội dung CMS từ server về thư mục `content/` trong mã nguồn, sau đó
 * (tuỳ chọn) commit và push lên GitHub để Vercel tự deploy lại.
 *
 *   npm run cms:sync                 # kéo về + commit + push
 *   npm run cms:sync -- --dry-run    # chỉ kéo về máy
 *   npm run cms:sync -- --no-push    # kéo về + commit (không push)
 *
 * Cấu hình qua biến môi trường:
 *   CMS_BASE_URL   (mặc định https://acd-arc.com)
 *   CMS_SYNC_SECRET (khuyến nghị - dùng để xác thực)
 *   CMS_EMAIL / CMS_PASSWORD (đăng nhập admin nếu không có secret)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noPush = args.includes("--no-push");

const baseUrl =
  process.env.CMS_BASE_URL || "https://acd-arc.com";
const secret = process.env.CMS_SYNC_SECRET || "";
const email = process.env.CMS_EMAIL || "";
const password = process.env.CMS_PASSWORD || "";

function log(message) {
  console.log(message);
}

async function authenticate() {
  if (secret) return { "x-cms-sync-secret": secret };

  if (!email || !password) {
    throw new Error(
      "Thiếu thông tin xác thực. Đặt CMS_SYNC_SECRET (khuyến nghị) hoặc " +
        "CMS_EMAIL + CMS_PASSWORD trong file .env.local."
    );
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Đăng nhập thất bại (${response.status}).`);
  }

  const cookie = response.headers.get("set-cookie") || "";
  const token = cookie.split(";")[0];
  if (!token) throw new Error("Không nhận được cookie đăng nhập.");

  return { Cookie: token };
}

async function fetchExport() {
  const headers = await authenticate();

  const response = await fetch(`${baseUrl}/api/cms/export`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tải nội dung CMS thất bại (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (!data.files) throw new Error("Phản hồi không hợp lệ.");
  return data;
}

function writeFiles(files) {
  const written = [];

  for (const [filePath, content] of Object.entries(files)) {
    const target = path.join(projectRoot, filePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
    written.push(filePath);
  }

  return written;
}

function run(command) {
  return execSync(command, { cwd: projectRoot, stdio: "inherit" }).toString();
}

async function main() {
  log(`→ Đang tải nội dung CMS từ ${baseUrl} ...`);
  const data = await fetchExport();

  const written = writeFiles(data.files);
  log(`✓ Đã ghi ${written.length} file vào thư mục content/:`);
  for (const file of written) log(`   - ${file}`);

  if (dryRun) {
    log("\n--dry-run: bỏ qua bước commit và push.");
    return;
  }

  log("\n→ Đang commit...");
  run("git add content");
  const status = run("git status --porcelain content").trim();
  if (!status) {
    log("✓ Không có thay đổi nào (nội dung đã đồng bộ sẵn).");
    return;
  }
  run(`git commit -m "content: đồng bộ nội dung CMS từ quản trị (${new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")})"`);

  if (noPush) {
    log("\n--no-push: đã commit cục bộ, bỏ qua push.");
    return;
  }

  log("\n→ Đang push lên GitHub (Vercel sẽ tự deploy)...");
  run("git push origin main");
  log("\n✓ Hoàn tất. Vercel sẽ tự động deploy trong vài phút.");
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
