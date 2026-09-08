"use client";

import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductInput } from "@/lib/api";
import type { Product } from "@/lib/products";

const EMPTY: ProductInput = {
  title: "",
  subtitle: "",
  defaultQuantity: 1,
  unitPrice: 0,
  sku: "",
};

/**
 * Add or edit a product.
 *
 * The image is handled apart from the text fields: it uploads to its own
 * endpoint against a saved row, so a new product is created first and the
 * picture attached straight after. That keeps a failed upload from losing
 * everything the admin typed.
 */
export function ProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: {
  /** The product being edited, or null to add a new one. */
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProductInput, image: File | null) => Promise<void>;
}) {
  const [values, setValues] = React.useState<ProductInput>(EMPTY);
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset every time the dialog opens, so a cancelled edit never leaks into
  // the next one.
  React.useEffect(() => {
    if (!open) return;
    setValues(
      product
        ? {
            title: product.title,
            subtitle: product.subtitle,
            defaultQuantity: product.defaultQuantity,
            unitPrice: product.unitPrice,
            sku: product.sku,
          }
        : EMPTY
    );
    setImage(null);
    setPreview(null);
    setError(null);
  }, [open, product]);

  // A blob URL has to be revoked or the file stays in memory for the session.
  React.useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const valid =
    values.title.trim().length > 0 &&
    values.sku.trim().length > 0 &&
    values.unitPrice > 0 &&
    values.defaultQuantity >= 1;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await onSave(
        {
          ...values,
          title: values.title.trim(),
          subtitle: values.subtitle.trim(),
          sku: values.sku.trim(),
        },
        image
      );
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const shown = preview ?? product?.imageUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            The active product is what the landing page sells and what every new
            order is priced against.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="product-title">Title</Label>
            <Textarea
              id="product-title"
              rows={2}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ইলিশের আচার ২০০ গ্রাম, গরুর মাংস আচার ২০০ গ্রাম…"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-subtitle">Subtitle</Label>
            <Textarea
              id="product-subtitle"
              rows={2}
              value={values.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Optional line shown under the title"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price (৳)</Label>
              <Input
                id="product-price"
                type="number"
                min={1}
                value={values.unitPrice || ""}
                onChange={(e) => set("unitPrice", Number(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-qty">Quantity</Label>
              <Input
                id="product-qty"
                type="number"
                min={1}
                max={99}
                value={values.defaultQuantity}
                onChange={(e) =>
                  set("defaultQuantity", Number(e.target.value) || 1)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={values.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="combo-1490"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-image">Image</Label>
            <div className="flex items-center gap-3">
              {shown ? (
                <Image
                  src={shown}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="size-14 rounded-md border object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  None
                </div>
              )}
              <Input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, GIF or WebP, up to 5 MB. Shown in the order summary on
              the landing page.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || busy}>
            {busy ? "Saving…" : product ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
