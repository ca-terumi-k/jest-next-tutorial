import React, { useState } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import { useFireStorage } from "@/hooks/useFireStorage";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
export const DeleteAllFilesButton: React.FC<{ userId: string }> = ({ userId }) => {
    const { deleteAllUserFiles: deleteAllFirestoreFiles, getUserFileList } = useFirestore();
    const { deleteAllUserFiles: deleteAllStorageFiles } = useFireStorage();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to delete all files? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            // まず、ユーザーのファイルリストを取得
            const userFiles = await getUserFileList(userId);
            const fileNames = userFiles.map((file) => file.fileName);

            // Firestoreからすべてのファイル参照を削除
            await deleteAllFirestoreFiles(userId);

            // Storageからすべてのファイルを削除
            const result = await deleteAllStorageFiles(userId, fileNames);

            if (result.failureCount > 0) {
                alert(
                    `Operation completed with some issues. ${result.failureCount} files could not be deleted from Storage. Please check the console for more details.`
                );
            } else {
                alert('All files have been successfully deleted.');
            }
        } catch (error) {
            alert(
                'An error occurred during the delete operation. Please check the console for more details.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.button
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="flex items-center block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:bg-red-50"
        >
            <Trash2 className="w-4 h-4 mr-3" />
            {isDeleting ? 'Deleting...' : 'Delete All Files'}
        </motion.button>
    );
};
