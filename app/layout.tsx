import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubMix - 订阅链接转换器",
  description: "SubMix - 将 VLESS、Hysteria2、Shadowsocks、Trojan 等订阅链接转换为 Mihomo 内核 YAML 配置文件",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="ca9e233c-e4b1-4af5-99d6-69066a8290e5"
          strategy="afterInteractive"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
