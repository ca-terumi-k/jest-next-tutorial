/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/app/AuthProvider";
import { useFirestore } from "@/hooks/useFirestore";
import { useFireStorage } from "@/hooks/useFireStorage";
import { db } from "@/lib/firebase/client";
import { FileData, FormattedDateProps } from "@/types/file";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { generateSignedUrl } from "@/app/dashboard/action";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface PDFViewModalProps {
    pdf: FileData;
    onDeleteSuccess: () => void;
    onClose: () => void;
}

interface FormatSummaryProps {
    summary: string;
}

interface SummaryVersion {
    content: string;
    timestamp: Timestamp;
}

const PDFViewModal: React.FC<PDFViewModalProps> = ({
    pdf,
    onDeleteSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [summaries, setSummaries] = useState<SummaryVersion[]>([]);
    const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);
    const [isSignedURL, setIsSignedURL] = useState(false);
    const [signedURL, setSignedURL] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuthContext();
    const {
        getViewFile,
        removeFileFromUserDocument,
        deleteFileDocument,
        updateFileSummaryDocument,
    } = useFirestore();
    const { deleteFile } = useFireStorage();

    const handleSummarize = useCallback(async () => {
        if (!user || isLoading || !isSignedURL) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: user.uid,
                    fileName: pdf.fileName,
                }),
            });

            if (!response.ok) {
                throw new Error("要約の生成に失敗しました");
            }

            const { summary } = await response.json();
            await updateFileSummaryDocument(user.uid, pdf.fileName, summary);
        } catch (error) {
            console.error("Error summarizing:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, pdf.fileName, isLoading, isSignedURL, updateFileSummaryDocument]);

    const handleDownload = useCallback(async () => {
        if (!isSignedURL) {
            console.error("署名付きURLが取得できていません");
            return;
        }
        try {
            const response = await fetch(signedURL);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = pdf.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    }, [isSignedURL, signedURL, pdf.fileName]);

    const handleDelete = useCallback(async () => {
        if (!user || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteFile(user.uid, pdf.fileName);
            await deleteFileDocument(pdf.fileName, user.uid);
            await removeFileFromUserDocument(user.uid, pdf.fileName);
            onDeleteSuccess();
        } catch (error) {
            console.error("Error deleting file:", error);
        } finally {
            setIsDeleting(false);
        }
    }, [
        user,
        isDeleting,
        pdf.fileName,
        deleteFile,
        deleteFileDocument,
        removeFileFromUserDocument,
        onDeleteSuccess,
    ]);

    const handleGetSummaries = useCallback(async () => {
        if (!user) return;

        try {
            const viewFile = await getViewFile(pdf.fileName, user.uid);
            if (viewFile && viewFile.summaries) {
                const sortedSummaries = [...viewFile.summaries].reverse();
                setSummaries(sortedSummaries as unknown as SummaryVersion[]);
                setSelectedVersionIndex(0);
            }
        } catch (error) {
            console.error("Error getting summaries: ", error);
        }
    }, [user, pdf.fileName, getViewFile]);

    const handleGetSignedUrl = useCallback(async () => {
        if (!user) return;
        try {
            const result = await generateSignedUrl({
                userId: user.uid,
                fileName: pdf.fileName,
            });
            if (result.flag === 1 && result.signedUrl) {
                setIsSignedURL(true);
                setSignedURL(result.signedUrl);
            }
        } catch (error) {
            console.error("Error getting signed URL:", error);
        }
    }, [user, pdf.fileName]);

    useEffect(() => {
        if (!user || !db) return;

        const fileDocRef = doc(db, "files", `${user.uid}_${pdf.fileName}`);
        const unsubscribe = onSnapshot(fileDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data && data.summaries) {
                    const sortedSummaries = [...data.summaries].reverse();
                    setSummaries(sortedSummaries);
                    setSelectedVersionIndex(0);
                }
            }
        });

        handleGetSummaries();
        handleGetSignedUrl();

        return () => {
            unsubscribe();
        };
    }, [user, pdf.fileName, handleGetSummaries, handleGetSignedUrl]);

    const FormattedDate: React.FC<FormattedDateProps> = ({
        date,
        prefix,
        className,
    }) => {
        let formattedDate: string;
        try {
            const parsedDate = date instanceof Timestamp ? date.toDate() : date;
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
            <span className={className}>
                {prefix} {formattedDate}
            </span>
        );
    };

    const FormatSummary: React.FC<FormatSummaryProps> = ({ summary }) => {
        return (
            <div className="formatted-summary">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    className="markdown max-w-none"
                >
                    {summary}
                </ReactMarkdown>
            </div>
        );
    };

    const loadingIconStyle = {
        animation: isLoading ? "spin 1s linear infinite" : "none",
    };

    // modal以外をクリックした時に閉じる

    // const handleModalClick = useCallback(
    //     (e: React.MouseEvent<HTMLDivElement>) => {
    //         if (e.target === e.currentTarget) {
    //             onClose();
    //         }
    //     },
    //     [onClose]
    // );

    // const handleKeyDown = useCallback(
    //     (e: React.KeyboardEvent<HTMLDivElement>) => {
    //         if (e.key === "Escape") {
    //             onClose();
    //         }
    //     },
    //     [onClose]
    // );

    return (
        <>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col relative p-8 mx-auto"
            >
                <h2 className="text-2xl font-bold mb-4">{pdf.fileName}</h2>

                <div className="flex flex-col h-full">
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Summary</h3>
                        <select
                            className="border rounded-md p-2"
                            value={selectedVersionIndex}
                            onChange={(e) =>
                                setSelectedVersionIndex(Number(e.target.value))
                            }
                        >
                            {summaries.length > 0 ? (
                                summaries.map((_, index) => (
                                    <option key={index} value={index}>
                                        Version {summaries.length - index}
                                    </option>
                                ))
                            ) : (
                                <option value="">No versions available</option>
                            )}
                        </select>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        key={pdf.id}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-grow overflow-y-auto bg-gray-100 rounded-lg p-8 min-h-[450px] max-h-[450px] prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedVersionIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {summaries.length > 0 ? (
                                    <FormatSummary
                                        summary={
                                            summaries[selectedVersionIndex]
                                                .content
                                        }
                                    />
                                ) : (
                                    <p className="text-gray-500 italic mb-4">
                                        まだサマリーがありません
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <div className="mt-4 text-right max-w-full overflow-hidden min-h-[40px] max-h-[40px]">
                        <FormattedDate
                            date={pdf.uploadTimestamp}
                            prefix="Uploaded on"
                            className="text-sm text-gray-600 truncate"
                        />
                    </div>
                </div>
            </motion.div>

            <div className="fixed bottom-32 flex flex-col right-8">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSummarize}
                    className="mb-2 right-8 bg-white hover:bg-grey text-block rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 z-40"
                    disabled={isLoading || !isSignedURL}
                    aria-label="Summarize document"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                    </svg>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownload}
                    className="mb-2 right-8 bg-white hover:bg-grey text-block rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 z-40"
                    disabled={isLoading}
                    aria-label="Download document"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="mb-2 right-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 z-40"
                    disabled={isDeleting}
                    aria-label="Delete document"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </motion.button>

                <hr className="border-white opacity-75"></hr>
            </div>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-white rounded-lg p-8 flex flex-col items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={loadingIconStyle}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            <span className="text-lg font-semibold text-gray-800">
                                Summarizing...
                            </span>
                            <p className="mt-2 text-sm text-gray-600">
                                Please wait while we process your document.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PDFViewModal;
