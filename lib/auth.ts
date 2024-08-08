import {
    browserSessionPersistence,
    GoogleAuthProvider,
    setPersistence,
    signInWithPopup,
    signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase/client";

export const signOutUser = () => {
    signOut(auth);
};

export const signInWithGoogle = async () => {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: "select_account",
        });
        const result = await signInWithPopup(auth, provider);
        return result;
    } catch (error) {
        // エラー処理
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const getCurrentUser = () => {
    return auth.currentUser;
};
