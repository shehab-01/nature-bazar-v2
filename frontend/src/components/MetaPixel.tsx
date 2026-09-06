"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { GTM_ID, PIXEL_ID } from "@/lib/tracking";

/**
 * Loads the Meta Pixel (and optionally GTM) on public storefront routes.
 * Admin routes are excluded so staff traffic never reaches ad platforms.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const lastTracked = useRef(pathname);

  useEffect(() => {
    if (isAdmin || pathname === lastTracked.current) return;
    // Fire PageView on client-side navigations; the initial load is covered
    // by the inline snippet below.
    lastTracked.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
    </>
  );
}
