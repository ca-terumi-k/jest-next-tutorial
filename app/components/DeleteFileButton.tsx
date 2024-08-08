import React from "react";
import { useFirestore } from "@/hooks/useFirestore";
import { useFireStorage } from "@/hooks/useFireStorage";

export const DeleteFileButton = ({
    uid,
    fileName,
    fileId,
}: {
    uid: string;
    fileName: string;
    fileId: string;
}) => {
    const { deleteFileDocument, removeFileFromUserDocument } = useFirestore();
    const { deleteFile } = useFireStorage();

    const handleDelete = async () => {
        try {
            await deleteFileDocument(uid, fileId);
            await removeFileFromUserDocument(uid, fileName);
            await deleteFile(uid, fileName);
            alert("File deleted successfully");
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file");
        }
    };

    return <button onClick={handleDelete}>Delete File</button>;
};
