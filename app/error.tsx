"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    エラーが発生しました
                </h1>
                <p className="text-gray-600 mb-6">
                    申し訳ありませんが、予期せぬエラーが発生しました。問題が解決しない場合は、サポートまでお問い合わせください。
                </p>
                <div className="flex justify-between items-center">
                    <button
                        onClick={reset}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
                    >
                        もう一度試す
                    </button>
                    <p className="text-sm text-gray-500">
                        エラーコード: {error.digest}
                    </p>
                </div>
            </div>
        </div>
    );
}
