#!/usr/bin/env node
/**
 * Theo dõi nhánh `main` trên GitHub và tự động `git pull` về máy khi CMS đã
 * đồng bộ nội dung mới. Nhờ vậy thư mục làm việc trong VSCode luôn khớp với
 * website đang chạy mà không cần thao tác tay.
 *
 *   npm run cms:watch
 *
 * Dừng: Ctrl+C
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const POLL_INTERVAL_MS = Number(
  process.env.CMS_WATCH_INTERVAL || 30_000
);
const BRANCH = process.env.CMS_WATCH_BRANCH || "main";
const REMOTE = process.env.CMS_WATCH_REMOTE || "origin";

function run(command, options = {}) {
  return execSync(command, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function log(message) {
  const now = new Date().toLocaleTimeString("vi-VN");
  console.log(`[${now}] ${message}`);
}

function hasUncommittedChanges() {
  return run("git status --porcelain").length > 0;
}

function hasConflicts() {
  return run("git diff --name-only --diff-filter=U").length > 0;
}

async function checkOnce() {
  try {
    run(`git fetch ${REMOTE} ${BRANCH}`);

    const behind = Number(
      run(`git rev-list --count HEAD..${REMOTE}/${BRANCH}`) || "0"
    );

    if (behind === 0) return;

    const sha = run(`git log -1 --pretty=format:%h ${REMOTE}/${BRANCH}`);
    const subject = run(`git log -1 --pretty=format:%s ${REMOTE}/${BRANCH}`);

    log(`Phát hiện ${behind} commit mới từ CMS: ${sha} - ${subject}`);

    if (hasUncommittedChanges()) {
      log(
        "Bỏ qua pull vì thư mục đang có thay đổi chưa commit. " +
          "Hãy commit/stash trước rồi chạy lại."
      );
      return;
    }

    // CMS push trực tiếp lên main nên nhánh có thể bị phân kỳ với commit
    // local -> dùng merge (không rebase) để không đổi SHA các commit đã push.
    run(`git pull --no-rebase --no-edit ${REMOTE} ${BRANCH}`);

    if (hasConflicts()) {
      log(
        "⚠ Có xung đột khi gộp nội dung CMS. Hãy mở tab Source Control để xử lý."
      );
      return;
    }

    log("✓ Đã cập nhật mã nguồn trong VSCode.");
  } catch (error) {
    log(`Lỗi khi kiểm tra cập nhật: ${error.message.split("\n")[0]}`);
  }
}

async function main() {
  log(`Đang theo dõi ${REMOTE}/${BRANCH} (mỗi ${POLL_INTERVAL_MS / 1000}s)...`);
  await checkOnce();

  setInterval(checkOnce, POLL_INTERVAL_MS);

  process.on("SIGINT", () => {
    log("Đã dừng theo dõi.");
    process.exit(0);
  });
}

main();
