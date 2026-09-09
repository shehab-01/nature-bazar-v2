"use client";

import type { LastOrder } from "@/lib/last-order";
import type { StorefrontProduct } from "@/lib/products";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 1490 -> "১,৪৯০", matching the Bengali numerals used elsewhere on the page. */
export function bengaliNumber(n: number): string {
  return n
    .toLocaleString("en-US")
    .replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

function agoInBengali(at: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - at) / 60_000));
  if (minutes < 1) return "এইমাত্র";
  if (minutes < 60) return `${bengaliNumber(minutes)} মিনিট আগে`;
  return `${bengaliNumber(Math.round(minutes / 60))} ঘণ্টা আগে`;
}

/**
 * The confirmation shown in place of the order form.
 *
 * `fresh` is the moment right after submitting: bigger congratulations and a
 * little confetti. On a return visit the same card shows calmly, with when
 * the order was placed, so nobody is confused about whether it went through.
 */
export function OrderSuccess({
  order,
  product,
  fresh,
}: {
  order: LastOrder;
  product: StorefrontProduct;
  fresh: boolean;
}) {
  const quantity = Math.max(1, product.defaultQuantity);
  return (
    <div className="order-done" role="status" aria-live="polite">
      {fresh && (
        <div className="order-done-confetti" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
      )}

      <div className="order-done-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {fresh ? (
        <>
          <h3>অভিনন্দন! 🎉</h3>
          <p className="order-done-lead">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</p>
        </>
      ) : (
        <>
          <h3>আপনার অর্ডার গ্রহণ করা হয়েছে</h3>
          <p className="order-done-lead">অর্ডার করেছেন {agoInBengali(order.at)}</p>
        </>
      )}

      <div className="order-done-no">
        <span>অর্ডার নম্বর</span>
        <strong>{order.orderNo}</strong>
      </div>

      <dl className="order-done-details">
        <div>
          <dt>নাম</dt>
          <dd>{order.name}</dd>
        </div>
        <div>
          <dt>ফোন</dt>
          <dd>{order.phone}</dd>
        </div>
        <div>
          <dt>ঠিকানা</dt>
          <dd>{order.address}</dd>
        </div>
        <div>
          <dt>পণ্য</dt>
          <dd>
            {product.title} × {bengaliNumber(quantity)}
            <small>
              {bengaliNumber(product.unitPrice * quantity)}৳ · ক্যাশ অন ডেলিভারি ·
              ফ্রি ডেলিভারি
            </small>
          </dd>
        </div>
      </dl>

      <div className="order-done-next">
        <strong>এরপর কী হবে?</strong>
        আমাদের প্রতিনিধি শিগগিরই <b>{order.phone}</b> নম্বরে ফোন করে অর্ডারটি
        কনফার্ম করবেন। অনুগ্রহ করে ফোনটি চালু রাখুন।
      </div>

      <p className="order-done-more">
        আরও কিছু নিতে চান? প্রতিনিধিকে ফোনেই জানিয়ে দিন।
      </p>
    </div>
  );
}
