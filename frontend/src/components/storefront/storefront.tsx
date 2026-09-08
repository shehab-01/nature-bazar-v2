"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

import { createOrder } from "@/lib/api";
import {
  normalisePhone,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackViewCart,
  trackViewItem,
} from "@/lib/tracking";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const orderTableRef = useRef<HTMLElement>(null);
  const checkoutStarted = useRef(false);

  // view_item: the storefront (single product page) was shown.
  useEffect(() => {
    trackViewItem();
  }, []);

  // view_cart: the "Your order" table scrolled into view, once per load.
  useEffect(() => {
    const el = orderTableRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackViewCart();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // begin_checkout: the user started filling the order form, once per load.
  function handleFormFocus() {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;
    trackBeginCheckout();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const customerName = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    setSubmitting(true);
    setSubmitError(false);
    try {
      const order = await createOrder({
        customerName,
        phone,
        address,
        quantity: 1,
      });
      setSubmitted(true);
      trackPurchase({
        transactionId: order.orderNo,
        user: {
          first_name: customerName.split(/\s+/)[0] ?? "",
          phone: normalisePhone(phone),
          street: address,
          country: "BD",
        },
      });
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="storefront">
      <header className="store-header">
        <Image
          src="/logo.png"
          alt="Nature Bazar"
          width={155}
          height={51}
          priority
        />
      </header>

      <div className="dark-zone">
        <section className="hero-image">
          <Image
            src="/campaign.jpg"
            alt="Nature Bazar Millionaire Campaign"
            width={1146}
            height={672}
            sizes="(max-width: 680px) 100vw, 680px"
            priority
          />
        </section>

        <section className="how-section">
          <Image
            src="/how-it-works.jpeg"
            alt="কীভাবে অংশগ্রহণ করবেন"
            width={812}
            height={232}
            sizes="(max-width: 680px) 100vw, 680px"
          />
        </section>

        <section className="order-btn-section">
          <a
            className="order-now"
            href="#order"
            onClick={() => trackAddToCart()}
          >
            অর্ডার করুন
          </a>
        </section>

        <section className="wide-image prizes-image">
          <Image
            src="/prizes.jpg"
            alt="Nature Bazar ক্যাম্পেইনের আকর্ষণীয় পুরস্কার"
            width={877}
            height={877}
            sizes="(max-width: 680px) 100vw, 680px"
          />
        </section>

        <section className="product-showcase">
          <Image
            src="/products.jpg"
            alt="ইলিশ, গরুর মাংস ও চেপা শুটকির আচার"
            width={1120}
            height={450}
            sizes="(max-width: 680px) 100vw, 680px"
          />
          <div className="offer-price-row">
            <Image
              src="/offer-price.png"
              alt="১৪৯০ টাকা অফার"
              width={180}
              height={120}
            />
          </div>
        </section>
      </div>

      <section className="order-section" id="order">
        {/* <p className="eyebrow">অর্ডার করতে নিচের ফর্মটি ফিলআপ করুন</p> */}
        <h2 className="eyebrow">অর্ডার করতে নিচের ফর্মটি ফিলআপ করুন</h2>
        {submitted ? (
          <div className="success">
            <strong>আপনার অর্ডারটি গ্রহণ করা হয়েছে!</strong>
            <span>আমাদের প্রতিনিধি খুব শিগগিরই আপনার সাথে যোগাযোগ করবেন।</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} onFocusCapture={handleFormFocus}>
            <label>
              নাম
              <input
                required
                name="name"
                maxLength={120}
                placeholder="আপনার নাম লিখুন"
              />
            </label>
            <label>
              ফোন নাম্বার
              <input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                minLength={6}
                maxLength={32}
                placeholder="আপনার ফোন নাম্বার লিখুন"
              />
            </label>
            <label>
              ঠিকানা
              <textarea
                required
                name="address"
                rows={3}
                minLength={4}
                maxLength={1000}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
              />
            </label>
            {submitError && (
              <p className="form-error">
                দুঃখিত, অর্ডারটি জমা দেওয়া যায়নি। একটু পরে আবার চেষ্টা করুন।
              </p>
            )}
            <button type="submit" disabled={submitting}>
              {submitting ? "অর্ডার পাঠানো হচ্ছে…" : "অর্ডার কনফার্ম করুন"}{" "}
              <span>→</span>
            </button>
            <small className="form-note">
              ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ফ্রি ডেলিভারি
            </small>
          </form>
        )}
      </section>

      <section className="order-details" ref={orderTableRef}>
        <h4>Shipping</h4>
        <div className="shipping-box">সারা বাংলাদেশ ফ্রী হোম ডেলিভারি।</div>
        <h4 className="order-summary-heading">Your order</h4>
        <div className="order-table">
          <div>
            <b>Product</b>
            <b>Subtotal</b>
          </div>
          <div>
            <div className="order-product">
              <Image
                src="/order-item.png"
                alt="আমাদের স্পেশাল আচার কম্বো"
                width={60}
                height={60}
              />
              <span>
                ইলিশের আচার ২০০ গ্রাম, গরুর মাংস আচার ২০০ গ্রাম, এবং চেপা শুটকির
                আচার ২০০ গ্রাম, কম্বো × 1
              </span>
            </div>
            <span>১,৪৯০.০০৳</span>
          </div>
          <div>
            <span>Subtotal</span>
            <span>১,৪৯০.০০৳</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>সারা বাংলাদেশ ফ্রী হোম ডেলিভারি।</span>
          </div>
          <div>
            <b>Total</b>
            <b>১,৪৯০.০০৳</b>
          </div>
        </div>
        <div className="cash-box">
          <h3>Cash on delivery</h3>
          <p>Pay with cash upon delivery.</p>
        </div>
        <p className="privacy-note">
          Your personal data will be used to process your order, support your
          experience throughout this website, and for other purposes described
          in our privacy policy.
        </p>
        <a
          className="checkout-button"
          href="#order"
          onClick={() => trackAddToCart()}
        >
          <span className="checkout-lock">🔒</span> অর্ডার করুন{" "}
          <span>১,৪৯০.০০৳</span>
        </a>
      </section>
      <footer className="store-footer">
        <Image src="/logo.png" alt="Nature Bazar" width={130} height={43} />
        <p>© 2026 naturebazar. All rights reserved.</p>
        <div>
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
        </div>
      </footer>
    </main>
  );
}
