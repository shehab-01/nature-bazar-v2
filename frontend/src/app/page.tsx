"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="storefront">
      <header className="store-header">
        <img src="/logo.png" alt="Nature Bazar" />
      </header>

      <div className="dark-zone">
      <section className="hero-image">
        <img src="/campaign.jpg" alt="Nature Bazar Millionaire Campaign" />
      </section>

      <section className="how-section">
        <img src="/how-it-works.jpeg" alt="কীভাবে অংশগ্রহণ করবেন" />
      </section>

      <section className="order-btn-section">
        <a className="order-now" href="#order">
          অর্ডার করুন
        </a>
      </section>

      <section className="wide-image prizes-image">
        <img
          src="/prizes.jpg"
          alt="Nature Bazar ক্যাম্পেইনের আকর্ষণীয় পুরস্কার"
        />
      </section>

      <section className="product-showcase">
        <img src="/products.jpg" alt="ইলিশ, গরুর মাংস ও চেপা শুটকির আচার" />
        <div className="offer-price-row">
          <img src="/offer-price.png" alt="১৪৯০ টাকা অফার" />
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
          <form onSubmit={handleSubmit}>
            <label>
              নাম
              <input required name="name" placeholder="আপনার নাম লিখুন" />
            </label>
            <label>
              ফোন নাম্বার
              <input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="আপনার ফোন নাম্বার লিখুন"
              />
            </label>
            <label>
              ঠিকানা
              <textarea
                required
                name="address"
                rows={3}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
              />
            </label>
            <button type="submit">
              অর্ডার কনফার্ম করুন <span>→</span>
            </button>
            <small className="form-note">
              ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ফ্রি ডেলিভারি
            </small>
          </form>
        )}
      </section>

      <section className="order-details">
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
              <img src="/order-item.png" alt="আমাদের স্পেশাল আচার কম্বো" />
              <span>
                ইলিশের আচার ২০০ গ্রাম, গরুর মাংস আচার ২০০ গ্রাম, এবং চেপা
                শুটকির আচার ২০০ গ্রাম, কম্বো × 1
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
          experience throughout this website, and for other purposes
          described in our privacy policy.
        </p>
        <a className="checkout-button" href="#order">
          <span className="checkout-lock">🔒</span> অর্ডার করুন{" "}
          <span>১,৪৯০.০০৳</span>
        </a>
      </section>
      <footer className="store-footer">
        <img src="/logo.png" alt="Nature Bazar" />
        <p>© 2026 naturebazar. All rights reserved.</p>
        <div>
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
        </div>
      </footer>
    </main>
  );
}
