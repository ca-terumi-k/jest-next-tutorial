import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/AuthProvider";
import Loading from "@/app/components/Loading";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PDFBrief",
    description: "PDFファイルの要約と管理を簡単に",
    keywords: ["PDF", "要約", "文書管理", "AI"],
    authors: [{ name: "terumin" }],
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
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
            <body className={`${inter.className} antialiased`}>
                <Suspense fallback={<Loading />}>
                    <AuthProvider>{children}</AuthProvider>
                </Suspense>
            </body>
        </html>
    );
}