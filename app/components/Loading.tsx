import React from "react";

const Loading: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg shadow-lg">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                </div>
                <p className="mt-4 text-xl font-semibold text-white">
                    Loading...
                </p>
                <div className="mt-2 text-sm text-blue-200">
                    PDFBriefがもうすぐ始まります
                </div>
            </div>
        </div>
    );
};

export default Loading;
