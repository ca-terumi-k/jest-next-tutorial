import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { FormattedDateProps, FileData } from "@/types/file";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps {
    files: FileData[];
    setMethod: (file: FileData) => void;
    setIsMethod: (isOpen: boolean) => void;
}

const Carousel: React.FC<CarouselProps> = ({
    files,
    setMethod: setSelectedPdf,
    setIsMethod: setIsPdfViewModalOpen,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const filesPerPage = 15;

    const { pageCount, displayedFiles } = useMemo(() => {
        if (!Array.isArray(files) || files.length === 0) {
            return { pageCount: 0, displayedFiles: [] };
        }
        const count = Math.max(1, Math.ceil(files.length / filesPerPage));
        const displayed = files.slice(
            currentPage * filesPerPage,
            (currentPage + 1) * filesPerPage
        );
        return { pageCount: count, displayedFiles: displayed };
    }, [files, currentPage]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 0) {
            setDirection(-1);
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < pageCount - 1) {
            setDirection(1);
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, pageCount]);

    const handleSelectFile = useCallback(
        (file: FileData) => {
            setSelectedPdf(file);
            setIsPdfViewModalOpen(true);
        },
        [setSelectedPdf, setIsPdfViewModalOpen]
    );

    const truncateFileName = useCallback(
        (fileName: string, maxLength: number = 20): string => {
            if (fileName.length <= maxLength) return fileName;
            const extension = fileName.split(".").pop();
            const nameWithoutExtension = fileName.substring(
                0,
                fileName.lastIndexOf(".")
            );
            const truncatedName = nameWithoutExtension.substring(
                0,
                maxLength - 3 - (extension?.length ?? 0)
            );
            return `${truncatedName}...${extension}`;
        },
        []
    );

    if (pageCount === 0) {
        return <div className="text-center py-4">No files available</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            <div
                className="flex-grow-[5] relative overflow-hidden"
                style={{ maxHeight: "calc(60vh)" }}
            >
                <div className="absolute inset-0 overflow-y-auto">
                    <AnimatePresence
                        initial={false}
                        custom={direction}
                        mode="wait"
                    >
                        <motion.div
                            key={currentPage}
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={pageTransition}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4"
                        >
                            {displayedFiles.map((file) => (
                                <FileItem
                                    key={`${file.id}-${file.uploadTimestamp}`}
                                    file={file}
                                    handleSelectFile={handleSelectFile}
                                    truncateFileName={truncateFileName}
                                />
                            ))}
                            {[
                                ...Array(
                                    Math.max(
                                        0,
                                        filesPerPage - displayedFiles.length
                                    )
                                ),
                            ].map((_, index) => (
                                <div
                                    key={`empty-${currentPage}-${index}`}
                                    className="hidden sm:block"
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className="flex-grow-[1]">
                <PaginationControls
                    currentPage={currentPage}
                    pageCount={pageCount}
                    handlePrevPage={handlePrevPage}
                    handleNextPage={handleNextPage}
                />
            </div>
        </div>
    );
};

const FileItem: React.FC<{
    file: FileData;
    handleSelectFile: (file: FileData) => void;
    truncateFileName: (fileName: string, maxLength?: number) => string;
}> = ({ file, handleSelectFile, truncateFileName }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105"
        onClick={() => handleSelectFile(file)}
    >
        <div className="p-4">
            <h2
                className="text-lg font-bold overflow-hidden whitespace-nowrap text-overflow-ellipsis"
                title={file.fileName}
            >
                {truncateFileName(file.fileName)}
            </h2>
            <p className="text-sm text-gray-500">
                <FormattedDate date={file.uploadTimestamp} prefix="Upload at" />
            </p>
        </div>
    </motion.div>
);

const FormattedDate: React.FC<FormattedDateProps> = ({ date, prefix }) => {
    let formattedDate: string;
    try {
        const parsedDate =
            date instanceof Timestamp ? date.toDate() : new Date(date);
        formattedDate = parsedDate.toLocaleString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return <span className="text-red-500">Invalid date</span>;
    }

    return (
        <span className="text-sm text-gray-600">
            {prefix} {formattedDate}
        </span>
    );
};

const PaginationControls: React.FC<{
    currentPage: number;
    pageCount: number;
    handlePrevPage: () => void;
    handleNextPage: () => void;
}> = ({ currentPage, pageCount, handlePrevPage, handleNextPage }) => (
    <div className="flex justify-center items-center py-4">
        <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="mr-4 p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full disabled:bg-gray-200 disabled:text-gray-400 transition-colors duration-200"
            aria-label="前のページ"
        >
            <ChevronLeft size={24} />
        </button>
        <span className="text-gray-700">
            {currentPage + 1} / {pageCount} ページ
        </span>
        <button
            onClick={handleNextPage}
            disabled={currentPage === pageCount - 1}
            className="ml-4 p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full disabled:bg-gray-200 disabled:text-gray-400 transition-colors duration-200"
            aria-label="次のページ"
        >
            <ChevronRight size={24} />
        </button>
    </div>
);

const pageVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
    }),
};

const pageTransition = {
    type: "tween",
    duration: 0.3,
};

export default Carousel;
