import { PayOS } from "@payos/node";
import { getSettings } from "@/lib/settings";

export async function getPayOSClient() {
  const settings = await getSettings();
  const clientId = (process.env.PAYOS_CLIENT_ID || settings.payosClientId || "").trim();
  const apiKey = (process.env.PAYOS_API_KEY || settings.payosApiKey || "").trim();
  const checksumKey = (
    process.env.PAYOS_CHECKSUM_KEY ||
    settings.payosChecksumKey ||
    settings.paymentWebhookSecret ||
    ""
  ).trim();

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("PAYOS_CONFIG_MISSING");
  }

  return new PayOS({ clientId, apiKey, checksumKey });
}

export function toPayOSOrderCode(orderNumber: string) {
  const digits = String(orderNumber || "").replace(/\D/g, "").slice(-9);
  const base = Number(digits || Date.now().toString().slice(-9));
  const suffix = Math.floor(Math.random() * 90) + 10;
  const code = Number(`${base}${suffix}`.slice(-12));
  return Number.isFinite(code) && code > 0 ? Math.floor(code) : Math.floor(Date.now() / 1000);
}