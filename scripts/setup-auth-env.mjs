#!/usr/bin/env node
/**
 * Nạp credential của nhà cung cấp lên Vercel trong một lệnh.
 *
 *   node scripts/setup-auth-env.mjs [--project acd-arc] [--env production,preview]
 *
 * Script hỏi từng giá trị (bỏ trống để bỏ qua), sau đó chạy
 * `vercel env add <NAME> <env> --sensitive` cho từng biến.
 */
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const args = process.argv.slice(2);

function argValue(flag, fallback) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const PROJECT = argValue("--project", "acd-arc");
const ENVIRONMENTS = argValue("--env", "production,preview")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const FIELDS = [
  {
    name: "GOOGLE_CLIENT_ID",
    label: "Google OAuth Client ID",
    required: false,
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    label: "Google OAuth Client Secret",
    required: false,
  },
  {
    name: "FACEBOOK_CLIENT_ID",
    label: "Facebook App ID",
    required: false,
  },
  {
    name: "FACEBOOK_CLIENT_SECRET",
    label: "Facebook App Secret",
    required: false,
  },
  {
    name: "TWILIO_ACCOUNT_SID",
    label: "Twilio Account SID",
    required: false,
  },
  {
    name: "TWILIO_AUTH_TOKEN",
    label: "Twilio Auth Token",
    required: false,
  },
  {
    name: "TWILIO_PHONE_NUMBER",
    label: "Twilio số gửi (E.164, ví dụ +12025550123)",
    required: false,
  },
  {
    name: "RESEND_API_KEY",
    label: "Resend API Key (gửi email)",
    required: false,
  },
  {
    name: "SMTP_HOST",
    label: "SMTP Host (nếu không dùng Resend)",
    required: false,
  },
  {
    name: "SMTP_PORT",
    label: "SMTP Port (mặc định 587)",
    required: false,
  },
  {
    name: "SMTP_USER",
    label: "SMTP User",
    required: false,
  },
  {
    name: "SMTP_PASS",
    label: "SMTP Password",
    required: false,
  },
];

function runVercel(argsList) {
  return new Promise((resolve, reject) => {
    const child = spawn("vercel", argsList, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (output += chunk.toString()));

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`vercel ${argsList.join(" ")} -> ${code}\n${output}`));
    });

    child.stdin.end();
  });
}

async function addEnv(name, value, environment) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      "vercel",
      ["env", "add", name, environment, "--sensitive", "--project", PROJECT],
      { stdio: ["pipe", "pipe", "pipe"], shell: process.platform === "win32" }
    );

    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (output += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(output)
        : reject(new Error(`vercel env add ${name} ${environment} -> ${code}\n${output}`))
    );

    child.stdin.write(value);
    child.stdin.end();
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question) =>
    new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

  console.log(`\nCấu hình credential đăng nhập cho project "${PROJECT}"`);
  console.log(`Môi trường: ${ENVIRONMENTS.join(", ")}\n`);
  console.log("Nhấn Enter để bỏ qua biến không dùng.\n");

  const values = new Map();

  for (const field of FIELDS) {
    const answer = await ask(`${field.label} [${field.name}]: `);
    if (answer) values.set(field.name, answer);
  }

  rl.close();

  if (!values.size) {
    console.log("\nKhông có giá trị nào được nhập. Không thay đổi gì trên Vercel.\n");
    return;
  }

  for (const [name, value] of values) {
    for (const environment of ENVIRONMENTS) {
      try {
        await runVercel(["env", "rm", name, environment, "--project", PROJECT, "--yes"]);
      } catch {
        /* biến chưa tồn tại là bình thường */
      }
      await addEnv(name, value, environment);
      console.log(`  ✓ ${name} -> ${environment}`);
    }
  }

  const hasGoogle = values.has("GOOGLE_CLIENT_ID") && values.has("GOOGLE_CLIENT_SECRET");
  const hasFacebook = values.has("FACEBOOK_CLIENT_ID") && values.has("FACEBOOK_CLIENT_SECRET");
  const hasSms = values.has("TWILIO_ACCOUNT_SID") && values.has("TWILIO_AUTH_TOKEN");
  const hasEmail = values.has("RESEND_API_KEY") || (values.has("SMTP_HOST") && values.has("SMTP_USER"));

  console.log("\nTrạng thái sau khi cấu hình:");
  console.log(`  Google OAuth : ${hasGoogle ? "sẵn sàng" : "thiếu credential"}`);
  console.log(`  Facebook     : ${hasFacebook ? "sẵn sàng" : "thiếu credential"}`);
  console.log(`  SMS          : ${hasSms ? "sẵn sàng" : "thiếu credential"}`);
  console.log(`  Email        : ${hasEmail ? "sẵn sàng" : "thiếu credential"}`);

  console.log("\nCần deploy lại để áp dụng:");
  console.log(`  vercel --prod --yes --project ${PROJECT}\n`);
}

main().catch((error) => {
  console.error("\nLỗi:", error.message);
  process.exit(1);
});
