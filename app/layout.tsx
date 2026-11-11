import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self Multimedia",
  description: "Personal Entertainment Center powered by Jellyfin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
