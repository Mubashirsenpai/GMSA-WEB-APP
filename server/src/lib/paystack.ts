const PAYSTACK_BASE = "https://api.paystack.co";

/** Paystack secret keys start with sk_test_ or sk_live_. Public keys (pk_*) must not be used here. */
function getSecretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    console.error("PAYSTACK_SECRET_KEY is not set. Add it to server/.env (secret key from Paystack Dashboard → Settings → API Keys).");
    return null;
  }
  if (key.startsWith("pk_")) {
    console.error("PAYSTACK_SECRET_KEY is set to a PUBLIC key (pk_...). You must use the SECRET key (sk_test_ or sk_live_) from Paystack Dashboard → Settings → API Keys.");
    return null;
  }
  return key;
}

export interface InitializePayload {
  email: string;
  amount: number; // GHS, will be converted to pesewas
  reference: string;
  callback_url: string;
  metadata?: Record<string, string>;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(payload: InitializePayload): Promise<InitializeResult | null> {
  const key = getSecretKey();
  if (!key) {
    console.error("PAYSTACK_SECRET_KEY is not set or is the public key. Use your secret key (sk_test_ or sk_live_) from Paystack Dashboard.");
    return null;
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: Math.round(payload.amount * 100), // GHS to pesewas
      reference: payload.reference,
      callback_url: payload.callback_url,
      currency: "GHS",
      metadata: payload.metadata,
    }),
  });
  const data = (await res.json()) as { status?: boolean; data?: { authorization_url?: string; access_code?: string; reference?: string } };
  if (!data.status || !data.data?.authorization_url) {
    console.error("Paystack initialize error:", data);
    return null;
  }
  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code ?? "",
    reference: data.data.reference ?? "",
  };
}

export interface VerifyResult {
  status: "success" | "failed";
  reference: string;
  amount: number;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult | null> {
  const key = getSecretKey();
  if (!key) return null;
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = (await res.json()) as { status?: boolean; data?: { status?: string; reference?: string; amount?: number } };
  if (!data.status || !data.data) return null;
  const d = data.data;
  const paid = d.status === "success";
  return {
    status: paid ? "success" : "failed",
    reference: d.reference ?? "",
    amount: (d.amount || 0) / 100, // pesewas to GHS
  };
}
