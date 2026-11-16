import { randomUUID } from "crypto";
import { siteConfig } from "@/lib/site";

const API_BASE = "https://api.yookassa.ru/v3";

function credentials() {
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim();
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim();
  if (!shopId || !secretKey) return null;
  return { shopId, secretKey };
}

export function isYooKassaConfigured() {
  return credentials() !== null;
}

function authHeader() {
  const creds = credentials();
  if (!creds) throw new Error("YooKassa is not configured");
  const token = Buffer.from(`${creds.shopId}:${creds.secretKey}`).toString("base64");
  return `Basic ${token}`;
}

type YooPaymentResponse = {
  id: string;
  status: string;
  paid: boolean;
  confirmation?: { confirmation_url?: string };
};

export async function createYooKassaPayment(input: {
  amountRub: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      "Idempotence-Key": randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: input.amountRub.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: input.returnUrl,
      },
      description: input.description.slice(0, 128),
      metadata: input.metadata,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YooKassa create payment failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as YooPaymentResponse;
  const confirmationUrl = data.confirmation?.confirmation_url;
  if (!confirmationUrl) {
    throw new Error("YooKassa did not return confirmation URL");
  }

  return { externalId: data.id, confirmationUrl };
}

export async function fetchYooKassaPayment(externalId: string) {
  const response = await fetch(`${API_BASE}/payments/${externalId}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YooKassa fetch payment failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as YooPaymentResponse;
  return { status: data.status, paid: data.paid };
}

export function buildPaymentReturnUrl(paymentId: string) {
  return `${siteConfig.url}/cabinet/subscriptions?payment=${encodeURIComponent(paymentId)}`;
}
