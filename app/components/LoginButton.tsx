"use client";
import Image from "next/image";
import { useAuthContext } from "@/app/AuthProvider";
import { redirect } from "next/navigation";

const LoginButton = () => {
    const { user, signInWithGoogle } = useAuthContext();

    if (user) {
        redirect("/dashboard");
    }

    const handleSignIn = async () => {
        try {
            // signInWithGoogle関数を呼び出して、Googleでサインインする
            await signInWithGoogle();
            redirect("/dashboard");
        } catch (error) {
            console.error(
                "Failed to sign in or initialize user settings",
                error
            );
        }
    };

    return (
        <button
            onClick={handleSignIn}
            className="flex items-center bg-white text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 mx-auto"
        >
            <Image
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                className="w-6 h-6 mr-2"
                width={24}
                height={24}
            />
            Googleでログイン
        </button>
    );
};

export default LoginButton;
