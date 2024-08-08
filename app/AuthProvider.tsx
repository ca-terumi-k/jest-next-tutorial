"use client";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { User, UserCredential } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    getCurrentUser: () => User | null;
    signInWithGoogle: () => Promise<UserCredential>;
    signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (auth.user && !auth.loading && pathname === "/") {
            router.push("/dashboard");
        }
    }, [auth.user, auth.loading, pathname, router]);

    const adjustedAuth: AuthContextType = {
        ...auth,
        signOutUser: async () => {
            await auth.signOutUser();
            router.push("/");
        },
    };

    if (auth.loading) {
        return <Loading />; // または適切なローディングコンポーネント
    }

    return (
        <AuthContext.Provider value={adjustedAuth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}