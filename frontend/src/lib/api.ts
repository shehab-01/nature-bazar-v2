import type { Order, OrderStatus, OrderTag } from "@/lib/orders";
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
  assigned_to: number | null;
  assigned_to_name: string | null;
  tags: { id: number; label: string; created_by_name: string | null }[];
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
    assignedToId: order.assigned_to,
    assignedToName: order.assigned_to_name,
    tags: order.tags.map(
      (tag): OrderTag => ({
        id: tag.id,
        label: tag.label,
        createdByName: tag.created_by_name,
      })
    ),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let detail: unknown = body;
    try {
      detail = (JSON.parse(body) as { detail?: unknown }).detail ?? body;
    } catch {
      // non-JSON error body; keep raw text
    }
    throw new Error(
      typeof detail === "string" && detail
        ? detail
        : `API ${res.status}: ${body.slice(0, 300)}`
    );
  }
  return res.json() as Promise<T>;
}

export async function createOrder(input: {
  customerName: string;
  phone: string;
  address: string;
  quantity?: number;
}): Promise<Order> {
  const order = await request<ApiOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      quantity: input.quantity ?? 1,
    }),
  });
  return mapOrder(order);
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
    }),
  });
  return mapOrder(order);
}

export async function claimOrder(id: number): Promise<Order> {
  return mapOrder(
    await request<ApiOrder>(`/api/orders/${id}/claim`, { method: "POST" })
  );
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
  pictureUrl: string | null;
  role: UserRole;
  status: UserStatus;
};

type ApiUser = {
  id: number;
  email: string;
  name: string;
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
  patch: { status?: UserStatus; role?: UserRole }
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
