"use client";

import * as React from "react";
import { ArrowLeft, Phone } from "lucide-react";

import { OrderTags } from "@/components/admin/orders/order-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateOrder } from "@/lib/api";
import {
  CHANGE_STATUS_OPTIONS,
  ORDER_STATUS_LABELS,
  STATUS_BADGE_CLASS,
  formatOrderDateTime,
  timeAgo,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (order: Order) => void;
}) {
  const [pendingStatus, setPendingStatus] = React.useState<OrderStatus | null>(
    null
  );
  const [note, setNote] = React.useState("");
  const [discount, setDiscount] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (order) {
      setPendingStatus(null);
      setNote(order.comment);
      setDiscount("");
      setEditName(order.customerName);
      setEditPhone(order.phone);
      setEditAddress(order.address);
      setError(null);
    }
  }, [order?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return null;

  const discountAmount = Math.min(
    Math.max(Number(discount) || 0, 0),
    order.total
  );
  const grandTotal = order.total - discountAmount;

  const detailsDirty =
    editName.trim() !== order.customerName ||
    editPhone.trim() !== order.phone ||
    editAddress.trim() !== order.address;

  const saveDetails = () =>
    run({
      customerName: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    });

  const run = async (patch: {
    status?: OrderStatus;
    comment?: string;
    customerName?: string;
    phone?: string;
    address?: string;
  }) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateOrder(order.id, patch);
      onOrderUpdated(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b px-6 py-4">
          <div>
            <DialogTitle>Web Order Details</DialogTitle>
            <DialogDescription>
              Review and manage this web order
            </DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <Badge className={cn("border-transparent", STATUS_BADGE_CLASS[order.status])}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
            <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              WEB
            </Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              Created&nbsp;
              <span className="font-medium text-foreground">
                {timeAgo(order.createdAt)}
              </span>
            </Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              Updated&nbsp;
              <span className="font-medium text-foreground">
                {timeAgo(order.updatedAt)}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[2fr_1fr]">
          {/* Main column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <SectionLabel>Customer details</SectionLabel>
              <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={editPhone}
                      onChange={(e) =>
                        setEditPhone(e.target.value.replace(/[^0-9+]/g, ""))
                      }
                      className="pr-9"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <a
                        href={`tel:${order.phone}`}
                        title="Call"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Phone className="size-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Shipping &amp; address</SectionLabel>
              <div className="rounded-xl border p-4">
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    rows={3}
                  />
                </div>
                {detailsDirty && (
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={busy}
                    onClick={saveDetails}
                  >
                    Save Details
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SectionLabel>Ordered products</SectionLabel>
                <Badge variant="secondary" className="rounded-sm">
                  1
                </Badge>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium">{order.product}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ৳{order.unitPrice.toLocaleString()} each
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Qty</Label>
                    <Input readOnly value={order.quantity} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price</Label>
                    <Input readOnly value={order.unitPrice} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total</Label>
                    <Input readOnly value={order.total.toFixed(2)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Order total</SectionLabel>
              <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min={0}
                    max={order.total}
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sub Total</Label>
                  <Input readOnly value={order.total} />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Charge</Label>
                  <Input readOnly value="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-destructive">Grand Total</Label>
                  <Input
                    readOnly
                    value={grandTotal}
                    className="border-destructive/50 text-destructive"
                  />
                </div>
              </div>
            </div>

            {order.status !== "confirmed" && order.status !== "shipped" && (
              <Button
                size="lg"
                disabled={busy}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={async () => {
                  const ok = await run({ status: "confirmed" });
                  if (ok) onOpenChange(false);
                }}
              >
                Approve Order (৳{grandTotal.toLocaleString()})
              </Button>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <SectionLabel>Order summary</SectionLabel>
                <span className="text-sm text-muted-foreground">
                  #{order.orderNo}
                </span>
              </div>
              <div className="rounded-xl border p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Date</p>
                    <p className="mt-0.5 font-medium">
                      {formatOrderDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="mt-0.5 font-medium">
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Payment</p>
                    <p className="mt-0.5 font-medium">COD</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Source</p>
                    <p className="mt-0.5 font-medium">Website</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{order.total}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>0</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Order tags</SectionLabel>
              <div className="rounded-xl border p-4">
                <OrderTags order={order} onOrderUpdated={onOrderUpdated} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Order actions</SectionLabel>
              <div className="flex flex-col gap-3 rounded-xl border p-4">
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex items-center gap-2">
                  <Select
                    value={pendingStatus ?? undefined}
                    onValueChange={(v) => setPendingStatus(v as OrderStatus)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANGE_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={
                      busy || !pendingStatus || pendingStatus === order.status
                    }
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                    onClick={() => pendingStatus && run({ status: pendingStatus })}
                  >
                    Update
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    <ArrowLeft className="mr-1 size-4" />
                    Back
                  </Button>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="mb-1.5 block">Note</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={busy || note === order.comment}
                    onClick={() => run({ comment: note })}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
