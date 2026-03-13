/**
 * Bulk SMS service. Configure your SMS provider (Hubtel, mNotify, Africa's Talking, etc.)
 * and implement the actual HTTP call in sendSms. This is a stub that logs and returns success.
 */
const SMS_API_URL = process.env.SMS_API_URL;
const SMS_API_KEY = process.env.SMS_API_KEY;

export async function sendSms(phone: string, message: string): Promise<boolean> {
  if (!SMS_API_URL || !SMS_API_KEY) {
    console.warn("SMS API not configured. Would send to", phone, ":", message.slice(0, 50) + "...");
    return true; // stub success for dev
  }
  try {
    const res = await fetch(SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SMS_API_KEY}` },
      body: JSON.stringify({ to: phone.replace(/\D/g, ""), message }),
    });
    return res.ok;
  } catch (e) {
    console.error("SMS send error:", e);
    return false;
  }
}

export async function sendBulkSms(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const phone of phones) {
    const ok = await sendSms(phone, message);
    if (ok) sent++;
    else failed++;
  }
  return { sent, failed };
}
