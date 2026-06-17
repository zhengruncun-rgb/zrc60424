import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "课后讲评与反馈助手｜村长说教育",
  description: "输入学生典型错误，3分钟看清能力卡点，整理出明天能讲的讲评建议。",
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
