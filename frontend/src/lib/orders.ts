export type OrderStatus =
  | "processing"
  | "incomplete"
  | "good_but_no_response"
  | "no_response"
  | "advance_payment"
  | "on_hold"
  | "confirmed"
  | "shipped"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  processing: "Processing",
  incomplete: "Incomplete",
  good_but_no_response: "Good But No Response",
  no_response: "No Response",
  advance_payment: "Advance Payment",
  on_hold: "On Hold",
  confirmed: "Confirmed Order",
  shipped: "Shipping",
  cancelled: "Cancel",
};

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = (
  Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]
).map((value) => ({ value, label: ORDER_STATUS_LABELS[value] }));

export const CHANGE_STATUS_OPTIONS = ORDER_STATUSES;

export const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  incomplete: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  good_but_no_response:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  no_response: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  advance_payment:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  confirmed: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export type OrderTag = {
  id: number;
  label: string;
  createdByName: string | null;
};

export type Order = {
  id: number;
  orderNo: string;
  customerName: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
  assignedToId: number | null;
  assignedToName: string | null;
  tags: OrderTag[];
};

export function formatOrderDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const time = d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toLowerCase();
  return `${date}, ${time}`;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `about ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
