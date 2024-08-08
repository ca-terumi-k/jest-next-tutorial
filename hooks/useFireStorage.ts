"use client";
import { useCallback, useState } from "react";
import { storage, db } from "@/lib/firebase/client";
import "firebase/app";
import "firebase/storage";
import {
    deleteObject,
    getDownloadURL,
    getMetadata,
    ref,
    uploadBytesResumable,
} from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";

interface UploadResult {
    downloadURL: string;
    metadata: any;
}

export const useFireStorage = () => {
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<Error | null>(null);

    const uploadFile = (
        path: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<UploadResult> => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    setError(error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref)
                        .then((downloadURL) => {
                            resolve({
                                downloadURL,
                                metadata: uploadTask.snapshot.metadata,
                            });
                        })
                        .catch((error) => {
                            setError(error);
                            reject(error);
                        });
                }
            );
        });
    };

    const fileExists = useCallback(async (uid: string, fileName: string) => {
        const fileRef = ref(storage, `uploads/${uid}/${fileName}`);
        try {
            await getMetadata(fileRef);
            return true;
        } catch (error: any) {
            if (error.code === "storage/object-not-found") {
                return false;
            }
            throw error;
        }
    }, []);

    const deleteFile = useCallback(
        async (uid: string, fileName: string, retries = 3) => {
            const fileRef = ref(storage, `uploads/${uid}/${fileName}`);

            if (!(await fileExists(uid, fileName))) {
                // console.log(`File ${fileName} does not exist, skipping.`);
                return;
            }

            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    await deleteObject(fileRef);
                    // console.log(`File deleted successfully: ${fileName}`);
                    return;
                } catch (error: any) {
                    // console.log(
                    //     `Attempt ${
                    //         attempt + 1
                    //     } failed to delete file: ${fileName}`,
                    //     error
                    // );
                    if (error.code === "storage/object-not-found") {
                        // console.log(
                        //     `File ${fileName} does not exist, skipping.`
                        // );
                        return;
                    }
                    if (attempt === retries - 1) {
                        // console.log(
                        //     `Failed to delete file after ${retries} attempts: ${fileName}`,
                        //     error
                        // );
                        throw error;
                    }
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * (attempt + 1))
                    );
                }
            }
        },
        [fileExists]
    );

    const deleteAllUserFiles = useCallback(
        async (userId: string, fileNames: string[]) => {
            const results = await Promise.allSettled(
                fileNames.map((fileName) => deleteFile(userId, fileName))
            );

            const successes = results.filter(
                (result) => result.status === "fulfilled"
            );
            const failures = results.filter(
                (result) => result.status === "rejected"
            ) as PromiseRejectedResult[];

            console.log(`Deleted ${successes.length} files successfully`);
            if (failures.length > 0) {
                console.error(
                    `Failed to delete ${failures.length} files:`,
                    failures.map((f) => f.reason)
                );
                setError(
                    new Error(`Failed to delete ${failures.length} files`)
                );
            }

            return {
                successCount: successes.length,
                failureCount: failures.length,
                failedFiles: failures.map((f) => f.reason),
            };
        },
        [deleteFile]
    );

    const getViewFile = async (fileId: string, uid: string) => {
        const docRef = doc(db, "files", `${uid}_${fileId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    };

    return {
        uploadFile,
        uploadProgress,
        deleteFile,
        deleteAllUserFiles,
        error,
        getViewFile,
    };
};