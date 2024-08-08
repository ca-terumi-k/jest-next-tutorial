import React, { ChangeEvent, useCallback, useState } from "react";
import { useAuthContext } from "@/app/AuthProvider";
import { useFirestore } from "@/hooks/useFirestore";
import { useFireStorage } from "@/hooks/useFireStorage";
import {
    ChevronDownIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { FileData } from "@/types/file";
import { AnimatePresence, motion } from "framer-motion";

interface FileUploadModalProps {
    onUploadSuccess: (fileId: string) => void;
    onClose: () => void;
}

interface UploadState {
    files: File[];
    uploading: boolean;
    progress: number;
    error: string | null;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
    onUploadSuccess,
    onClose,
}) => {
    const [uploadState, setUploadState] = useState<UploadState>({
        files: [],
        uploading: false,
        progress: 0,
        error: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [isMultipleUpload, setIsMultipleUpload] = useState(false);

    const { user } = useAuthContext();
    const { uploadFile } = useFireStorage();
    const { updateFileSummaryDocument, addDocument } = useFirestore();

    const handleToggle = () => {
        setIsMultipleUpload(!isMultipleUpload);
        setUploadState((prev) => ({
            ...prev,
            files: [],
            error: null,
        }));
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    }, []);

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement> | React.DragEvent) => {
            let files: FileList | null = null;

            if ("dataTransfer" in e) {
                files = e.dataTransfer.files;
            } else if ("target" in e && e.target instanceof HTMLInputElement) {
                files = e.target.files;
            }

            if (files) {
                const selectedFiles = Array.from(files).filter(
                    (file) => file.type === "application/pdf"
                );

                if (selectedFiles.length === 0) {
                    setUploadState((prev) => ({
                        ...prev,
                        error: "PDFファイルのみアップロード可能です。",
                    }));
                    return;
                }

                setUploadState((prev) => ({
                    ...prev,
                    files: isMultipleUpload
                        ? [...prev.files, ...selectedFiles]
                        : [selectedFiles[0]],
                    error: null,
                }));
            }
        },
        [isMultipleUpload]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            handleFileChange(e);
        },
        [handleFileChange]
    );

    const handleUpload = async () => {
        if (uploadState.files.length === 0 || !user) {
            setUploadState((prev) => ({
                ...prev,
                error: "ファイルが選択されていないか、ユーザーがログインしていません。",
            }));
            return;
        }

        setUploadState((prev) => ({
            ...prev,
            uploading: true,
            progress: 0,
            error: null,
        }));

        try {
            const totalFiles = uploadState.files.length;
            for (let i = 0; i < totalFiles; i++) {
                const file = uploadState.files[i];
                // ファイルをアップロード
                await uploadFile(
                    `uploads/${user.uid}/${file.name}`,
                    file,
                    (progress) => {
                        const overallProgress =
                            ((i + progress / 100) / totalFiles) * 100;
                        setUploadState((prev) => ({
                            ...prev,
                            progress: overallProgress,
                        }));
                    }
                );
                const insFile: FileData = {
                    id: `${user.uid}_${file.name}`,
                    fileName: `${file.name}`,
                    uploadTimestamp: new Date(),
                };

                // ファイル情報をFirestoreに保存
                await addDocument(user.uid, insFile);

                // 要約の生成
                setIsLoading(true);
                if (!isMultipleUpload) {
                    const response = await fetch('/api/summarize', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            uid: user.uid,
                            fileName: file.name,
                        }),
                        mode: 'cors',
                    });

                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }

                    const { summary } = await response.json();
                    await updateFileSummaryDocument(user.uid, file.name, summary);
                }
                setIsLoading(false);
                onUploadSuccess(file.name);
            }

            // すべてのファイルのアップロードが完了したらモーダルを閉じる
            onClose();
        } catch (err) {
            // console.error("Error processing file:", err);
            setUploadState((prev) => ({
                ...prev,
                error: 'ファイルの処理中にエラーが発生しました。もう一度お試しください。',
            }));
        } finally {
            setIsLoading(false);
            setUploadState((prev) => ({
                ...prev,
                uploading: false,
                files: [],
            }));
        }
    };

    const removeFile = (index: number) => {
        setUploadState((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }));
    };

    const loadingIconStyle = {
        animation: isLoading ? "spin 1s linear infinite" : "none",
    };
    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-700">
                        ファイルアップロード
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleToggle}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isMultipleUpload ? "bg-blue-600" : "bg-gray-200"
                            }`}
                            role="switch"
                            aria-checked={isMultipleUpload}
                        >
                            <span className="sr-only">
                                {isMultipleUpload ? "複数" : "単一"}
                            </span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isMultipleUpload
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                }`}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-900">
                            {isMultipleUpload ? "複数" : "単一"}
                        </span>
                    </div>
                </div>
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
                    <div
                        className="relative border-2 rounded-lg transition-colors duration-300 ease-in-out h-[200px] overflow-hidden
                        ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : uploadState.files.length > 0
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-blue-500'
                        }"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="h-full overflow-auto">
                            {uploadState.files.length === 0 ? (
                                <label
                                    htmlFor="uploadInput"
                                    className="flex flex-col items-center justify-center h-full p-6 cursor-pointer"
                                >
                                    <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                                        ファイルをアップロード
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        クリックまたはドラッグ＆ドロップでファイルを選択
                                    </p>
                                </label>
                            ) : uploadState.files.length === 1 ? (
                                <div className="flex items-center justify-start p-4">
                                    <DocumentIcon className="w-8 h-8 text-green-500 flex-shrink-0 mr-2" />
                                    <div className="flex-grow min-w-0">
                                        <p
                                            className="text-sm font-semibold text-gray-700 truncate"
                                            title={uploadState.files[0].name}
                                        >
                                            {uploadState.files[0].name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(
                                                uploadState.files[0].size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(0)}
                                        className="ml-2 p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                        title="ファイルを削除"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="sticky top-0 bg-gray-100 p-2 border-b flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">
                                            アップロードされたファイル
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {uploadState.files.length} ファイル
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        {uploadState.files.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-start mb-2"
                                                >
                                                    <DocumentIcon className="w-8 h-8 text-green-500 flex-shrink-0 mr-2" />
                                                    <div className="flex-grow min-w-0">
                                                        <p
                                                            className="text-sm font-semibold text-gray-700 truncate"
                                                            title={file.name}
                                                        >
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(
                                                                file.size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeFile(index)
                                                        }
                                                        className="ml-2 p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                                        title="ファイルを削除"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {dragActive && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                                <p className="text-lg font-semibold text-blue-500">
                                    ドロップしてファイルをアップロード
                                </p>
                            </div>
                        )}
                        {uploadState.files.length > 1 && (
                            <div className="absolute bottom-0 left-0 right-0 text-center pb-1">
                                <ChevronDownIcon className="w-6 h-6 mx-auto text-gray-400 animate-bounce" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploadState.uploading}
                        id="uploadInput"
                        multiple={isMultipleUpload}
                    />
                </div>
                <button
                    onClick={handleUpload}
                    className="mt-4 w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                        uploadState.files.length === 0 || uploadState.uploading
                    }
                >
                    {uploadState.uploading
                        ? `アップロード中... ${uploadState.progress.toFixed(
                              0
                          )}%`
                        : `${
                              isMultipleUpload ? "複数ファイル" : "ファイル"
                          }をアップロード`}
                </button>
                {uploadState.progress > 0 && (
                    <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${uploadState.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                {uploadState.error && (
                    <p className="mt-4 text-red-600">{uploadState.error}</p>
                )}
                {isMultipleUpload && (
                    <p className="mt-2 text-sm text-gray-500">
                        注意: 複数ファイルアップロード時は要約は生成されません。
                    </p>
                )}
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

export default FileUploadModal;
