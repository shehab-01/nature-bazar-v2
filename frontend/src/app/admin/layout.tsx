import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Nature Bazar Admin",
  description: "Manage orders for Nature Bazar.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
