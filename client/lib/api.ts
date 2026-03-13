import { getMessageForStatus, SAFE_MESSAGES } from "./safeError";

const API_BASE = typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gmsa_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(SAFE_MESSAGES.network);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Prefer backend error message when present and safe (short, no paths/codes)
    const errMsg = (data as { error?: string }).error;
    const msg =
      typeof errMsg === "string" && errMsg.length > 0 && errMsg.length < 200
        ? errMsg
        : getMessageForStatus(res.status);
    throw new Error(msg);
  }
  return data as T;
}

/** Upload an image file; returns the public URL. Use for event/blog cover images. */
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    headers,
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof (data as { error?: string }).error === "string" &&
      (data as { error: string }).error.length < 200
        ? (data as { error: string }).error
        : getMessageForStatus(res.status);
    throw new Error(msg);
  }
  return (data as { url: string }).url;
}

export const auth = {
  login: (username: string, password: string) =>
    api<{ user: unknown; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (body: {
    email: string;
    password: string;
    name: string;
    username: string;
    phone: string;
    whatsappContact?: string;
    gender: "MALE" | "FEMALE";
    programOfStudy: string;
  }) =>
    api<{ user: unknown; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => api<unknown>("/auth/me"),
};

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("gmsa_token", token);
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("gmsa_token");
}
