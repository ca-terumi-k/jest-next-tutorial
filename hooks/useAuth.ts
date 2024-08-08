"use client";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUser, signOutUser, signInWithGoogle } from "@/lib/auth";
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let authStateChanged = false;
        const minLoadingTime = 1000; // 1秒
        const startTime = Date.now();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            authStateChanged = true;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < minLoadingTime) {
                setTimeout(() => {
                    setUser(user);
                    setLoading(false);
                }, minLoadingTime - elapsedTime);
            } else {
                setUser(user);
                setLoading(false);
            }
        });

        // タイムアウトの設定
        const timeoutId = setTimeout(() => {
            if (!authStateChanged) {
                setLoading(false);
                setError(
                    "認証の初期化に時間がかかっています。ネットワーク接続を確認してください。"
                );
            }
        }, 10000); // 10秒後にタイムアウト

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    return {
        user,
        loading,
        error,
        getCurrentUser,
        signInWithGoogle,
        signOutUser,
    };
}
