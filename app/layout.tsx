import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "务实教育产品顾问 | 个人介绍页",
  description: "个人介绍页：教育场景产品化、内容提效与品牌官网落地。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
