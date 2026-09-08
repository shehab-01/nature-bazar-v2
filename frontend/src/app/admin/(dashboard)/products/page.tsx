"use client";

import Image from "next/image";
import * as React from "react";

import { ProductDialog } from "@/components/admin/products/product-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  activateProduct,
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from "@/lib/api";
import type { Product } from "@/lib/products";

/**
 * The catalogue. Exactly one product is active at a time — that is the one the
 * landing page shows and the one every new order is priced against — so the
 * table leads with which that is rather than burying it in a column.
 */
export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setProducts(await listProducts());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Save the text fields, then the image if one was picked. A new product has
   * to exist before its image can be attached, since the upload endpoint is
   * addressed by row id.
   */
  const handleSave = React.useCallback(
    async (values: ProductInput, image: File | null) => {
      const saved = editing
        ? await updateProduct(editing.id, values)
        : await createProduct(values);
      if (image) await uploadProductImage(saved.id, image);
      await refresh();
    },
    [editing, refresh]
  );

  const handleActivate = React.useCallback(async (id: number) => {
    setBusyId(id);
    setError(null);
    try {
      setProducts(await activateProduct(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not activate");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleDelete = React.useCallback(
    async (product: Product) => {
      if (
        !window.confirm(
          `Delete "${product.title}"? Past orders keep the name and price they recorded.`
        )
      ) {
        return;
      }
      setBusyId(product.id);
      setError(null);
      try {
        await deleteProduct(product.id);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete");
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          One product is live at a time. Activating another swaps what the
          landing page sells immediately.
        </p>
        <Button onClick={openAdd}>Add product</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="w-24 text-right">Price</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-32">SKU</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-56 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products yet. Add one to start selling.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-md border border-dashed" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.title}</div>
                    {product.subtitle && (
                      <div className="text-xs text-muted-foreground">
                        {product.subtitle}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ৳ {product.unitPrice}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {product.defaultQuantity}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge>Live</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!product.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId !== null}
                          onClick={() => handleActivate(product.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        // The live product has no replacement until another is
                        // activated, so the API refuses this too.
                        disabled={product.isActive || busyId !== null}
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog
        product={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
