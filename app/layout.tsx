import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    // アプリケーションのタイトル
    title: "Todoアプリ",
    // アプリケーションの概要
    description: "タスクの管理と効率的な作業をサポートするTodoアプリ。シンプルで使いやすいインターフェースが特徴です。",
    // アプリケーションのキーワード (SEO向け)
    keywords: ["Todo", "タスク管理", "効率化", "シンプルアプリ"],
    // アプリケーションの言語
    language: "ja",
    // 著者情報
    author: "Terumi Kawano",
    // アプリケーションのテーマカラー
    themeColor: "#ffffff",
    // Open Graph 情報 (SNS共有時に使用)
    openGraph: {
        title: "Todoアプリ",
        description: "タスク管理をシンプルに。Todoアプリで作業を効率化しましょう。",
        url: "https://example.com", // あなたのアプリのURL
        type: "website",
        images : "https://example.com/ogp.png",// オープングラフ用画像
    },
    // Twitter カード設定 (SNS共有時に使用)
    twitter: {
        card: "summary_large_image",
        title: "Todoアプリ",
        description: "タスク管理をシンプルに。Todoアプリで作業を効率化しましょう。",
        images : "https://example.com/ogp.png",// Twitterカード用画像
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