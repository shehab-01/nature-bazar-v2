import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
