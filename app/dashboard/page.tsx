"use client";
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    Suspense,
} from "react";
import { useAuthContext } from "@/app/AuthProvider";
import Header from "@/app/components/Header";
import Carousel from "@/app/components/Carousel";
import FileUploadModal from "@/app/components/FileUpload";
import PDFViewModal from "@/app/components/PDFView";
import { useFirestore } from "@/hooks/useFirestore";
import Toast from "@/app/components/Toast";
import { FileData } from "@/types/file";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "@/app/components/SkeletonLoader";
import AccountSettingsModal from "@/app/components/AccountSetting";

type ModalWrapperProps = {
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
};

const ModalWrapper = ({ children, onClose, isOpen }: ModalWrapperProps) => {
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 flex items-center justify-center z-20"
                    >
                        <div className="rounded-lg p-6 w-full">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Dashboard = () => {
    const { user } = useAuthContext();
    const [activeModal, setActiveModal] = useState<
        "upload" | "pdf" | "settings" | null
    >(null);
    const [selectedPdf, setSelectedPdf] = useState<FileData | null>(null);
    const [pdfFiles, setPdfFiles] = useState<FileData[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const { subscribeToUserFiles, loading } = useFirestore();

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (user) {
            unsubscribe = subscribeToUserFiles(user.uid, (files) => {
                setPdfFiles(files);
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user, subscribeToUserFiles]);

    const openModal = useCallback((modalType: 'upload' | 'pdf' | 'settings') => {
        setActiveModal(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
    }, []);

    const toggleModal = useCallback(() => {
        setActiveModal((prev) => (prev ? null : 'upload'));
    }, []);

    const onUploadSuccess = useCallback(() => {
        setIsUpdating(true);
        closeModal();
        setToast({
            message: 'ファイルのアップロードに成功しました',
            type: 'success',
        });
        setIsUpdating(false);
    }, [closeModal]);

    const onDeleteSuccess = useCallback(() => {
        closeModal();
        setToast({
            message: 'ファイルを削除しました',
            type: 'success',
        });
    }, [closeModal]);

    const onSettingsSaveSuccess = useCallback(() => {
        closeModal();
        setToast({
            message: '設定を保存しました',
            type: 'success',
        });
    }, [closeModal]);

    const memoizedCarousel = useMemo(
        () => (
            <Suspense fallback={<SkeletonLoader />}>
                <Carousel
                    files={pdfFiles}
                    setMethod={(pdf: FileData) => {
                        setSelectedPdf(pdf);
                        openModal('pdf');
                    }}
                    setIsMethod={() => {}} // この関数は不要になりました
                />
            </Suspense>
        ),
        [openModal, pdfFiles]
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-gray-100 min-h-screen"
            style={{ backgroundColor: '#CECECE' }}
        >
            <Header setSettingOpen={() => openModal('settings')} />
            <AnimatePresence mode="wait">
                <motion.main
                    key={pdfFiles.length}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex-grow p-6 w-3/4 mx-auto m-20"
                >
                    {loading ? (
                        <SkeletonLoader />
                    ) : !pdfFiles || pdfFiles.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <p className="text-xl font-semibold mb-4">
                                保存されたファイルはありません
                            </p>
                            <p>まずはファイルをアップロードしてみましょう</p>
                        </motion.div>
                    ) : (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="max-h-80"
                        >
                            <h2 className="text-xl font-semibold mb-4">
                                保存されたファイル（{pdfFiles.length}）
                            </h2>
                            {memoizedCarousel}
                        </motion.section>
                    )}
                </motion.main>
            </AnimatePresence>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleModal}
                className="fixed right-8 bottom-8 bg-white hover:bg-grey text-block rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 z-40"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {activeModal ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    )}
                </svg>
            </motion.button>

            {/* Modals */}
            <div>
                <ModalWrapper isOpen={activeModal === 'upload'} onClose={closeModal}>
                    <FileUploadModal onUploadSuccess={onUploadSuccess} onClose={closeModal} />
                </ModalWrapper>

                <ModalWrapper
                    isOpen={activeModal === 'pdf' && selectedPdf !== null}
                    onClose={closeModal}
                >
                    {selectedPdf && (
                        <PDFViewModal
                            key="pdf-modal"
                            pdf={selectedPdf}
                            onDeleteSuccess={onDeleteSuccess}
                            onClose={closeModal}
                        />
                    )}
                </ModalWrapper>

                <ModalWrapper isOpen={activeModal === 'settings'} onClose={closeModal}>
                    <AccountSettingsModal isOpen={true} onClose={onSettingsSaveSuccess} />
                </ModalWrapper>
            </div>

            {/* Multi file upload  */}
            <AnimatePresence>
                {isUpdating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white p-6 rounded-lg shadow-xl"
                        >
                            <p className="text-lg font-semibold">ファイルリストを更新中...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;