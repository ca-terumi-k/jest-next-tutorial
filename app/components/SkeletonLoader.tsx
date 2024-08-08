import React from "react";

const CarouselSkeleton: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[...Array(15)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                    >
                        <div className="p-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="fixed w-full flex justify-center items-center bottom-10 left-0">
                <div className="mr-4 p-2 bg-gray-200 rounded-full w-10 h-10"></div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="ml-4 p-2 bg-gray-200 rounded-full w-10 h-10"></div>
            </div>
        </>
    );
};

export default CarouselSkeleton;
