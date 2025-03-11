import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Evalo - Student Feedback Platform",
  description:
    "A platform for teachers to collect and analyze student feedback",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "public/favicon.ico" },
      { url: "public/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "public/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "public/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
