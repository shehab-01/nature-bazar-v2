import type { Metadata } from "next";
import "./globals.css";

import MetaPixel from "@/components/MetaPixel";
import { bengali, hindSiliguri, manrope } from "@/lib/fonts";
import { pixelBootstrap } from "@/lib/pixel-bootstrap";
import { PIXEL_ID } from "@/lib/tracking";

export const metadata: Metadata = {
  title: "Nature Bazar",
  description: "A fresh starting point.",
};

// Built once at module load: PIXEL_ID is a build-time constant.
const PIXEL_BOOTSTRAP = pixelBootstrap(PIXEL_ID);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The root layout wraps the admin too, so one class serves both.
    <html lang="en" className={`${manrope.variable} ${bengali.variable} ${hindSiliguri.variable}`}>
      <head>
        {PIXEL_BOOTSTRAP && (
          <>
            <link rel="preconnect" href="https://connect.facebook.net" />
            {/* Synchronous and first: defines window.fbq so no event is ever
                dropped, sets _fbp/_fbc, and fires the initial PageView. The
                SDK itself is loaded later by <MetaPixel />. Skips /admin. */}
            <script
              id="meta-pixel-bootstrap"
              dangerouslySetInnerHTML={{ __html: PIXEL_BOOTSTRAP }}
            />
          </>
        )}
      </head>
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
