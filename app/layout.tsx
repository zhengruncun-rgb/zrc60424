import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "课后讲评与反馈助手",
  description: "用于生成课后讲评与反馈内容的 MVP 工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
