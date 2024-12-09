import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    // アプリケーションのタイトル
    title: "Todoアプリ",
    // アプリケーションの説明
    description: "タスク管理をシンプルに効率化するTodoアプリ。使いやすいインターフェースで生産性を向上。",
    // Open Graph の設定
    openGraph: {
        title: "Todoアプリ",
        description: "タスク管理をシンプルに効率化するTodoアプリ。使いやすいインターフェースで生産性を向上。",
        url: "https://example.com", // あなたのアプリのURL
        images: [
            {
                url: "https://example.com/og-image.png", // オープングラフ用画像
                width: 1200,
                height: 630,
                alt: "Todoアプリのスクリーンショット",
            },
        ],
    },
    // Twitter カード設定
    twitter: {
        card: "summary_large_image",
        title: "Todoアプリ",
        description: "タスク管理をシンプルに効率化するTodoアプリ。使いやすいインターフェースで生産性を向上。",
        images: ["https://example.com/twitter-image.png"], // Twitter用画像
    },
};



export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja" suppressHydrationWarning>
            <head />
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}