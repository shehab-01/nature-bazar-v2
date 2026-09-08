// The one fetch wrapper both the storefront and the admin share. It knows
// nothing about orders or users, so importing it never drags either in.

/** A non-2xx API response, with the status so callers can branch on it. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Turn a non-2xx response into an ApiError carrying the API's own detail. */
async function throwForStatus(res: Response): Promise<never> {
  const body = await res.text().catch(() => "");
  let detail: unknown = body;
  try {
    detail = (JSON.parse(body) as { detail?: unknown }).detail ?? body;
  } catch {
    // non-JSON error body; keep raw text
  }
  throw new ApiError(
    typeof detail === "string" && detail
      ? detail
      : `API ${res.status}: ${body.slice(0, 300)}`,
    res.status
  );
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) await throwForStatus(res);
  return res.json() as Promise<T>;
}

/** For endpoints that answer 204: there is no body to parse. */
export async function requestVoid(
  path: string,
  init?: RequestInit
): Promise<void> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) await throwForStatus(res);
}

/**
 * A multipart upload. No Content-Type is set on purpose — the browser has to
 * add its own, including the boundary, which a hardcoded header would break.
 */
export async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(path, { method: "POST", body });
  if (!res.ok) await throwForStatus(res);
  return res.json() as Promise<T>;
}
