import { request, requestForm, requestVoid } from "@/lib/http";
import type {
  Order,
  OrderItem,
  OrderSource,
  OrderStatus,
  OrderTag,
} from "@/lib/orders";
import type { Product } from "@/lib/products";
import type { TeamMember, UserRole, UserStatus } from "@/lib/team";

// Same-origin "/api/*" is proxied by Next.js to the FastAPI service
// (see next.config.ts), so no CORS and only one exposed port.

type ApiOrder = {
  id: number;
  order_no: string;
  customer_name: string;
  phone: string;
  address: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  comment: string;
  created_at: string;
  updated_at: string;
  source: OrderSource;
  printed: boolean;
  courier: boolean;
  assigned_to: number | null;
  assigned_to_name: string | null;
  assigned_to_nickname: string | null;
  assigned_at: string | null;
  claim_active: boolean;
  handled_by_name: string | null;
  handled_by_nickname: string | null;
  auto_captured: boolean;
  pathao_consignment_id: string | null;
  pathao_status: string | null;
  pathao_delivery_fee: number | null;
  pathao_sent_at: string | null;
  pathao_tracking_url: string | null;
  tags: {
    id: number;
    label: string;
    created_by_name: string | null;
    created_by_nickname: string | null;
  }[];
  items: ApiOrderItem[];
};

type ApiOrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderListResponse = {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export type OrderStats = {
  total: number;
  in_progress: number;
  confirmed: number;
  cancelled: number;
  revenue: number;
  incomplete: number;
};

export type OrderListParams = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus[];
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  sort?: string;
};

function mapOrder(order: ApiOrder): Order {
  return {
    id: order.id,
    orderNo: order.order_no,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    product: order.product_name,
    quantity: order.quantity,
    unitPrice: order.unit_price,
    total: order.total_amount,
    status: order.status,
    comment: order.comment,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    source: order.source,
    printed: order.printed,
    courier: order.courier,
    assignedToId: order.assigned_to,
    assignedToName: order.assigned_to_name,
    assignedToNickname: order.assigned_to_nickname,
    assignedAt: order.assigned_at,
    claimActive: order.claim_active,
    staffName: order.handled_by_name,
    staffNickname: order.handled_by_nickname,
    autoCaptured: order.auto_captured,
    pathaoConsignmentId: order.pathao_consignment_id ?? null,
    pathaoStatus: order.pathao_status ?? null,
    pathaoDeliveryFee: order.pathao_delivery_fee ?? null,
    pathaoSentAt: order.pathao_sent_at ?? null,
    pathaoTrackingUrl: order.pathao_tracking_url ?? null,
    items: (order.items ?? []).map(
      (item): OrderItem => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        lineTotal: item.line_total,
      })
    ),
    tags: order.tags.map(
      (tag): OrderTag => ({
        id: tag.id,
        label: tag.label,
        createdByName: tag.created_by_name,
        createdByNickname: tag.created_by_nickname,
      })
    ),
  };
}

export async function getOrderCounts(): Promise<Record<OrderStatus, number>> {
  const data = await request<{ counts: Record<string, number> }>(
    "/api/orders/counts"
  );
  return data.counts as Record<OrderStatus, number>;
}

export async function listOrders(
  params: OrderListParams
): Promise<OrderListResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("page_size", String(params.pageSize));
  for (const status of params.status ?? []) search.append("status", status);
  if (params.dateFrom) search.set("date_from", params.dateFrom);
  if (params.dateTo) search.set("date_to", params.dateTo);
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);

  const data = await request<{
    items: ApiOrder[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
  }>(`/api/orders?${search.toString()}`);

  return {
    items: data.items.map(mapOrder),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    pages: data.pages,
  };
}

export async function updateOrder(
  id: number,
  patch: {
    status?: OrderStatus;
    comment?: string;
    customerName?: string;
    phone?: string;
    address?: string;
    printed?: boolean;
    courier?: boolean;
  }
): Promise<Order> {
  const order = await request<ApiOrder>(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: patch.status,
      comment: patch.comment,
      customer_name: patch.customerName,
      phone: patch.phone,
      address: patch.address,
      printed: patch.printed,
      courier: patch.courier,
    }),
  });
  return mapOrder(order);
}

export type BulkSkipped = { orderId: number; orderNo: string; reason: string };

/** One change on many orders. Orders someone else holds come back skipped. */
export async function bulkUpdateOrders(
  ids: number[],
  patch: { status?: OrderStatus; printed?: boolean; courier?: boolean }
): Promise<{ updated: Order[]; skipped: BulkSkipped[] }> {
  const data = await request<{
    updated: ApiOrder[];
    skipped: { order_id: number; order_no: string; reason: string }[];
  }>("/api/orders/bulk", {
    method: "POST",
    body: JSON.stringify({
      order_ids: ids,
      status: patch.status,
      printed: patch.printed,
      courier: patch.courier,
    }),
  });
  return {
    updated: data.updated.map(mapOrder),
    skipped: data.skipped.map((s) => ({
      orderId: s.order_id,
      orderNo: s.order_no,
      reason: s.reason,
    })),
  };
}

export type PathaoFailure = { orderId: number; orderNo: string; error: string };
export type PathaoResult = { orders: Order[]; failed: PathaoFailure[] };

type ApiPathaoResult = {
  orders: ApiOrder[];
  failed: { order_id: number; order_no: string; error: string }[];
};

function mapPathaoResult(data: ApiPathaoResult): PathaoResult {
  return {
    orders: data.orders.map(mapOrder),
    failed: data.failed.map((f) => ({
      orderId: f.order_id,
      orderNo: f.order_no,
      error: f.error,
    })),
  };
}

/**
 * How many orders go in one Pathao request. Must not exceed the API's own
 * PATHAO_BATCH_LIMIT, which rejects anything larger.
 *
 * The server talks to Pathao one order at a time — only the per-order endpoint
 * returns a consignment id, and we need that to track and print the parcel —
 * so a batch's wall time grows with its length. Twenty finishes inside
 * Cloudflare's 100s proxy timeout with room to spare.
 */
const PATHAO_BATCH = 20;

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

/**
 * Run a Pathao call in batches, back to back, merging the results.
 *
 * Each batch the server accepts is committed order by order, so work already
 * done survives a later batch failing: once anything has come back we return
 * the partial result and report the rest as failures rather than throwing away
 * the successes. A first-batch failure still throws, so a small selection
 * behaves exactly as a single request would.
 */
async function pathaoBatched(
  path: string,
  ids: number[]
): Promise<PathaoResult> {
  const merged: PathaoResult = { orders: [], failed: [] };
  const batches = chunk(ids, PATHAO_BATCH);

  for (const [index, batch] of batches.entries()) {
    try {
      const result = mapPathaoResult(
        await request<ApiPathaoResult>(path, {
          method: "POST",
          body: JSON.stringify({ order_ids: batch }),
        })
      );
      merged.orders.push(...result.orders);
      merged.failed.push(...result.failed);
    } catch (err) {
      if (index === 0) throw err;
      // Some of this batch may already be booked at Pathao, so the reason says
      // "check" rather than claiming they were not sent. Re-sending is safe
      // either way: the API refuses an order that already has a consignment.
      const reason = err instanceof Error ? err.message : "Request failed";
      for (const id of batches.slice(index).flat()) {
        merged.failed.push({
          orderId: id,
          orderNo: `NB-${id}`,
          error: `Not completed — ${reason}. Check Pathao before retrying.`,
        });
      }
      break;
    }
  }
  return merged;
}

/** Book each order with Pathao. Successes carry the consignment id. */
export async function sendToPathao(ids: number[]): Promise<PathaoResult> {
  return pathaoBatched("/api/orders/pathao/send", ids);
}

/** Pull the latest delivery status from Pathao for booked orders. */
export async function refreshPathao(ids: number[]): Promise<PathaoResult> {
  return pathaoBatched("/api/orders/pathao/refresh", ids);
}

/** Take an order (open its modal). 409 means someone else is on it. */
export async function claimOrder(id: number): Promise<Order> {
  return mapOrder(
    await request<ApiOrder>(`/api/orders/${id}/claim`, { method: "POST" })
  );
}

export type Claim = {
  id: number;
  assignedToId: number;
  assignedToName: string | null;
  assignedToNickname: string | null;
  assignedAt: string;
};

/** Who holds which order right now — small enough to poll every few seconds. */
export async function listClaims(): Promise<{ ttlSeconds: number; claims: Claim[] }> {
  const data = await request<{
    ttl_seconds: number;
    claims: {
      id: number;
      assigned_to: number;
      assigned_to_name: string | null;
      assigned_to_nickname: string | null;
      assigned_at: string;
    }[];
  }>("/api/orders/claims");
  return {
    ttlSeconds: data.ttl_seconds,
    claims: data.claims.map((c) => ({
      id: c.id,
      assignedToId: c.assigned_to,
      assignedToName: c.assigned_to_name,
      assignedToNickname: c.assigned_to_nickname,
      assignedAt: c.assigned_at,
    })),
  };
}

/** Release on the way out of the page; keepalive survives the tab closing. */
export function releaseOrderOnLeave(id: number): void {
  try {
    void fetch(`/api/orders/${id}/release`, { method: "POST", keepalive: true });
  } catch {
    // The claim expires on its own after CLAIM_TTL_MS anyway.
  }
}

export async function releaseOrder(id: number): Promise<Order> {
  return mapOrder(
    await request<ApiOrder>(`/api/orders/${id}/release`, { method: "POST" })
  );
}

export async function addOrderTag(orderId: number, label: string): Promise<Order> {
  return mapOrder(
    await request<ApiOrder>(`/api/orders/${orderId}/tags`, {
      method: "POST",
      body: JSON.stringify({ label }),
    })
  );
}

export async function getOrderStats(): Promise<OrderStats> {
  return request<OrderStats>("/api/orders/stats");
}

// ---- Auth & users ----

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  nickname: string | null;
  pictureUrl: string | null;
  role: UserRole;
  status: UserStatus;
};

type ApiUser = {
  id: number;
  email: string;
  name: string;
  nickname: string | null;
  picture_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_active_at: string | null;
  orders_confirmed?: number;
  orders_shipped?: number;
};

function mapAuthUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    pictureUrl: user.picture_url,
    role: user.role,
    status: user.status,
  };
}

function mapTeamMember(user: ApiUser): TeamMember {
  return {
    ...mapAuthUser(user),
    joinedAt: user.created_at,
    lastActiveAt: user.last_active_at,
    ordersConfirmed: user.orders_confirmed ?? 0,
    ordersShipped: user.orders_shipped ?? 0,
  };
}

/** Current session's user, or null when not signed in. */
export async function getMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return mapAuthUser(await res.json());
}

export async function loginWithGoogle(credential: string): Promise<AuthUser> {
  const user = await request<ApiUser>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  return mapAuthUser(user);
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function listUsers(): Promise<TeamMember[]> {
  const users = await request<ApiUser[]>("/api/users");
  return users.map(mapTeamMember);
}

export async function updateUser(
  id: number,
  patch: { status?: UserStatus; role?: UserRole; nickname?: string }
): Promise<TeamMember> {
  const user = await request<ApiUser>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return mapTeamMember(user);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API ${res.status}`);
}

// ---------------------------------------------------------------- system

export type TrafficTotals = {
  requests: number;
  throttled: number;
  cooldown: number;
  client_errors: number;
  server_errors: number;
  latency_ms: number;
  avg_latency_ms: number;
};

export type TrafficPoint = Omit<TrafficTotals, "avg_latency_ms"> & {
  minute: string;
};

export type LimiterSnapshot = {
  name: string;
  limit: number;
  window_seconds: number;
  tracked_ips: number;
  blocked_now: number;
  blocked_ips: string[];
  seen_blind_requests: boolean;
};

export type LogEntry = {
  time: string;
  level: string;
  logger: string;
  worker: string;
  message: string;
};

export type OrderFlow = {
  orders_placed: number;
  forms_captured: number;
  confirmed: number;
  cancelled: number;
};

export type SystemOverview = {
  generated_at: string;
  database: {
    ok: boolean;
    latency_ms: number;
    size_bytes: number;
    version: string;
    pool: { size: number; in_use: number; overflow: number; max_overflow: number };
  };
  traffic: {
    per_minute: TrafficPoint[];
    last_hour: TrafficTotals;
    last_24h: TrafficTotals;
    flush_every_seconds: number;
  };
  orders: {
    flow: { last_hour: OrderFlow; last_24h: OrderFlow };
    by_status: Record<string, number>;
    total: number;
    pending_signins: number;
  };
  rate_limits: {
    limiters: LimiterSnapshot[];
    order_cooldown_hours: number;
    client_ip_header: string;
  };
  request: {
    client_ip: string | null;
    client_ip_visible: boolean;
    via_cloudflare: boolean;
    country: string | null;
  };
  server: {
    load: [number, number, number];
    cpus: number;
    memory_total: number | null;
    memory_available: number | null;
    disk_total: number;
    disk_free: number;
  };
  process: {
    worker: string;
    started_at: string;
    uptime_seconds: number;
    workers_configured: number;
    python: string;
  };
  integrations: {
    meta_pixel: boolean;
    meta_capi: boolean;
    meta_test_mode: boolean;
    google_login: boolean;
    secure_cookies: boolean;
  };
  recent_logs: LogEntry[];
};

/** Super admin only: everything the System page shows, in one call. */
export function getSystemOverview(): Promise<SystemOverview> {
  return request<SystemOverview>("/api/system/overview");
}

// --- Products ---------------------------------------------------------------

type ApiProduct = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string | null;
  default_quantity: number;
  unit_price: number;
  sku: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    imageUrl: p.image_url,
    defaultQuantity: p.default_quantity,
    unitPrice: p.unit_price,
    sku: p.sku,
    isActive: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export type ProductInput = {
  title: string;
  subtitle: string;
  defaultQuantity: number;
  unitPrice: number;
  sku: string;
};

function productBody(patch: Partial<ProductInput>) {
  return {
    title: patch.title,
    subtitle: patch.subtitle,
    default_quantity: patch.defaultQuantity,
    unit_price: patch.unitPrice,
    sku: patch.sku,
  };
}

export async function listProducts(): Promise<Product[]> {
  return (await request<ApiProduct[]>("/api/products")).map(mapProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return mapProduct(
    await request<ApiProduct>("/api/products", {
      method: "POST",
      body: JSON.stringify(productBody(input)),
    })
  );
}

export async function updateProduct(
  id: number,
  patch: Partial<ProductInput>
): Promise<Product> {
  return mapProduct(
    await request<ApiProduct>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(productBody(patch)),
    })
  );
}

/** Make one product the live one. Returns the whole list, already re-ordered. */
export async function activateProduct(id: number): Promise<Product[]> {
  return (
    await request<ApiProduct[]>(`/api/products/${id}/activate`, {
      method: "POST",
    })
  ).map(mapProduct);
}

export async function deleteProduct(id: number): Promise<void> {
  await requestVoid(`/api/products/${id}`, { method: "DELETE" });
}

/**
 * Upload a product image. Sent as multipart, so this bypasses `request` —
 * that helper forces a JSON content type, and the browser has to set its own
 * multipart boundary here.
 */
export async function uploadProductImage(
  id: number,
  file: File
): Promise<Product> {
  const form = new FormData();
  form.append("file", file);
  return mapProduct(
    await requestForm<ApiProduct>(`/api/products/${id}/image`, form)
  );
}


// --- Manual orders ----------------------------------------------------------

export type ManualOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  items: { productId: number; quantity: number }[];
  comment?: string;
  /** true drops it straight into Confirmed; false leaves it on Web Order List. */
  approved: boolean;
};

/**
 * Create an order on the customer's behalf. Only product ids and quantities go
 * up — the API prices the cart from the catalogue, so a tampered browser can
 * never set its own total.
 */
export async function createManualOrder(
  input: ManualOrderInput
): Promise<Order> {
  return mapOrder(
    await request<ApiOrder>("/api/orders/manual", {
      method: "POST",
      body: JSON.stringify({
        customer_name: input.customerName,
        phone: input.phone,
        address: input.address,
        items: input.items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
        comment: input.comment ?? "",
        approved: input.approved,
      }),
    })
  );
}

export type PhoneLookup = {
  /** Orders this number actually placed. */
  orders: Order[];
  /** Storefront forms this number filled in but never submitted. */
  incomplete: Order[];
};

/**
 * What this number has done before. Informational only — it never stops staff
 * taking another order, it just lets them say "this one is already on its way"
 * before the customer repeats themselves.
 *
 * Abandoned forms come back separately: nothing was ordered, so it is a lead
 * to close rather than a delivery to explain.
 *
 * These are whole orders, not summaries, so opening one from the results costs
 * no extra request.
 */
export async function lookupOrdersByPhone(
  phone: string
): Promise<PhoneLookup> {
  const data = await request<{
    phone: string;
    orders: ApiOrder[];
    incomplete: ApiOrder[];
  }>(`/api/orders/lookup?phone=${encodeURIComponent(phone)}`);

  return {
    orders: (data.orders ?? []).map(mapOrder),
    incomplete: (data.incomplete ?? []).map(mapOrder),
  };
}
