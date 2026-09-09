import type { Metadata } from "next";
import "./globals.css";

import MetaPixel from "@/components/MetaPixel";
import { bengali, hindSiliguri, manrope } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Nature Bazar",
  description: "A fresh starting point.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The root layout wraps the admin too, so one class serves both.
    <html lang="en" className={`${manrope.variable} ${bengali.variable} ${hindSiliguri.variable}`}>
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
