import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

if (!getApps()?.length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.STORAGE_BUCKET,
    });
}

export const store = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export const bucket = storage.bucket();

// セッションクッキーの設定を定義
export const SESSION_COOKIE_OPTIONS = {
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5日間（ミリ秒）
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 本番環境ではtrueに
    path: "/",
    sameSite: "strict" as const,
};

// セッションクッキーを作成する関数
export async function createSessionCookie(idToken: string) {
    const expiresIn = SESSION_COOKIE_OPTIONS.maxAge;
    return await auth.createSessionCookie(idToken, { expiresIn });
}