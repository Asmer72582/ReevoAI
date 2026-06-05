const TOKEN_KEY = "reevo_token";
const REQUEST_TIMEOUT_MS = 12_000;

/** In dev, call the API directly so login works even if Vite proxy is misconfigured. */
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:3001/api" : "/api");

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function formatErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
  }
  if (status === 0) return "Cannot reach API — run: npm run dev:api";
  return "Request failed";
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = options;
  const token = getStoredToken();

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        ...rest,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: json !== undefined ? JSON.stringify(json) : rest.body,
      },
      REQUEST_TIMEOUT_MS,
    );
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(
      aborted
        ? `API timed out (${API_BASE}). Kill stuck servers: lsof -i :3001 then npm run dev:api`
        : `Cannot reach API at ${API_BASE} — run npm run dev:api in another terminal`,
      0,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(formatErrorMessage(data, res.status), res.status);
  }
  return data as T;
}

export async function pingApi(): Promise<{ ok: boolean; mongodb?: boolean; error?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/health`, { method: "GET" }, 5000);
    const data = (await res.json()) as { ok?: boolean; mongodb?: boolean };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: Boolean(data.ok), mongodb: data.mongodb };
  } catch {
    return { ok: false, error: "unreachable" };
  }
}

export type SessionUser = { id: string; email: string; name: string };

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: SessionUser; token: string }>("/auth/login", { method: "POST", json: { email, password } }),
  register: (email: string, password: string, name: string) =>
    api<{ user: SessionUser; token: string }>("/auth/register", {
      method: "POST",
      json: { email, password, name },
    }),
  logout: () => api<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  me: () => api<{ user: SessionUser }>("/auth/me"),
};

export async function fetchPublicReviewForm(token: string) {
  const res = await fetch(`${API_BASE}/public/review/${token}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Link not found", res.status);
  return data as { brandName: string; label: string; acceptsImages: boolean; maxImages: number };
}

export async function submitPublicReview(
  token: string,
  payload: { name: string; text: string; stars: number; images: File[] },
) {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("text", payload.text);
  form.append("stars", String(payload.stars));
  payload.images.forEach((file) => form.append("images", file));

  const res = await fetch(`${API_BASE}/public/review/${token}`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Submit failed", res.status);
  return data;
}

export const reviewLinkApi = {
  get: () => api<{ token: string; url: string; active: boolean; label: string }>("/review-link"),
  regenerate: () =>
    api<{ token: string; url: string; active: boolean; label: string }>("/review-link/regenerate", {
      method: "POST",
    }),
};
