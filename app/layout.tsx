import type { Metadata } from "next";
import "./globals.css";

/**
 * 页面元信息，会渲染到 HTML <head> 中的 <title> 和 <meta name="description">
 */
export const metadata: Metadata = {
  title: "DailyMate · 个人超级助手",
  description:
    "AI 驱动的个人助手：每日简报、天气查询、旅游规划、假期规划",
};

/**
 * Next.js 根布局组件 —— 所有页面共享的 HTML 骨架。
 * 在 <head> 中引入 Google Fonts（Orbitron 标题字体 + Exo 2 正文字体 + JetBrains Mono 等宽字体）。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
