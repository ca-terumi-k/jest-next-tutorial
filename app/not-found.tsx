import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-600 mb-8">
                    ページが見つかりません
                </h2>
                <p className="text-xl text-gray-500 mb-8">
                    申し訳ありませんが、お探しのページは存在しないか、移動した可能性があります。
                </p>
                <Link
                    href="/"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out inline-block"
                    as="font"
                    type="font/woff2"
                >
                    ホームに戻る
                </Link>
                <div className="mt-12">
                    <p className="text-gray-400">
                        お探しのものが見つからない場合は、
                        <a href="/contact" className="text-blue-500 hover:underline">
                            お問い合わせ
                        </a>
                        ください。
                    </p>
                </div>
            </div>
        </div>
    );
}
