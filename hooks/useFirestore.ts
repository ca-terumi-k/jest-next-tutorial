"use client";
import { useCallback, useRef, useState } from "react";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    FirestoreError,
    updateDoc,
    arrayUnion,
    runTransaction,
    query,
    where,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
    deleteDoc,
    writeBatch,
    getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { FileData, ViewFileData } from '@/types/file';

export const useFirestore = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<FirestoreError | null>(null);
    const cacheRef = useRef<{ [userId: string]: FileData[] }>({});

    const addDocument = async (userId: string, fileData: FileData): Promise<string> => {
        const fileId = `${userId}_${fileData.fileName}`;

        try {
            await runTransaction(db, async (transaction) => {
                const userDocRef = doc(db, 'users', userId);
                const fileDocRef = doc(db, 'files', fileId);

                const userDoc = await transaction.get(userDocRef);
                const fileDoc = await transaction.get(fileDocRef);

                if (fileDoc.exists()) {
                    // ファイルが既に存在する場合は更新
                    transaction.update(fileDocRef, {
                        ...fileData,
                        uploadTimestamp: fileData.uploadTimestamp,
                    });
                } else {
                    // 新しいファイルを作成
                    transaction.set(fileDocRef, {
                        ...fileData,
                        id: fileId,
                        userId: userId,
                    });
                }

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const existingFiles = userData.files || [];
                    const fileIndex = existingFiles.findIndex((f: FileData) => f.id === fileId);

                    if (fileIndex !== -1) {
                        // 既存のファイル参照を更新
                        existingFiles[fileIndex] = {
                            id: fileId,
                            fileName: fileData.fileName,
                            uploadTimestamp: fileData.uploadTimestamp,
                        };
                        transaction.update(userDocRef, {
                            files: existingFiles,
                        });
                    } else {
                        // 新しいファイル参照を追加
                        transaction.update(userDocRef, {
                            files: arrayUnion({
                                id: fileId,
                                fileName: fileData.fileName,
                                uploadTimestamp: fileData.uploadTimestamp,
                            }),
                        });
                    }
                } else {
                    // 新しいユーザードキュメントを作成
                    transaction.set(userDocRef, {
                        files: [
                            {
                                id: fileId,
                                fileName: fileData.fileName,
                                uploadTimestamp: fileData.uploadTimestamp,
                            },
                        ],
                    });
                }
            });
            return fileId;
        } catch (error) {
            console.error('Error adding/updating file document: ', error);
            throw error as FirestoreError;
        }
    };

    const addFileToUserDocument = async (fileData: FileData, userId: string): Promise<string> => {
        try {
            const docRef = doc(db, 'files', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // ドキュメントが存在する場合は更新
                await updateDoc(docRef, {
                    files: arrayUnion(fileData),
                });
            } else {
                // ドキュメントが存在しない場合は新規作成
                await setDoc(docRef, {
                    files: [fileData],
                });
            }
            return userId;
        } catch (error) {
            console.error('Error adding file to user document: ', error);
            throw error as FirestoreError;
        }
    };

    const getUserFileList = useCallback(async (userId: string): Promise<FileData[]> => {
        setLoading(true);
        setError(null);

        // キャッシュをチェック
        if (cacheRef.current[userId]) {
            setLoading(false);
            return cacheRef.current[userId];
        }

        try {
            const userRef = doc(collection(db, 'users'), userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData && Array.isArray(userData.files)) {
                    const fileList = userData.files as FileData[];

                    // 結果をキャッシュ
                    cacheRef.current[userId] = fileList;

                    return fileList;
                }
            }
            return [];
        } catch (err) {
            setError(err as FirestoreError);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCache = useCallback((userId?: string) => {
        if (userId) {
            delete cacheRef.current[userId];
        } else {
            cacheRef.current = {};
        }
    }, []);

    const getViewFile = useCallback(
        (fileName: string, uid: string) => {
            // ファイルの参照を取得 filesコレクションから
            const fileRef = doc(db, 'files', `${uid}_${fileName}`);
            // ファイルのデータを取得
            return getDoc(fileRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const fileData = docSnap.data() as ViewFileData;
                    return fileData;
                } else {
                    return null;
                }
            });
            // 例外処理は呼び出し元で行う
        },

        []
    );

    const subscribeToUserFiles = useCallback(
        (userId: string, callback: (files: FileData[]) => void) => {
            setLoading(true);
            setError(null);

            const q = query(collection(db, 'files'), where('userId', '==', userId));

            const unsubscribe = onSnapshot(
                q,
                (snapshot: QuerySnapshot<DocumentData>) => {
                    const files: FileData[] = [];
                    snapshot.forEach((doc) => {
                        files.push({ id: doc.id, ...doc.data() } as FileData);
                    });
                    callback(files);
                    setLoading(false);
                },
                (err: FirestoreError) => {
                    console.error('Error getting documents:', err);
                    setError(err);
                    setLoading(false);
                }
            );

            // アンサブスクライブ関数を返す
            return unsubscribe;
        },
        []
    );

    const deleteFileDocument = useCallback(async (fileName: string, uid: string) => {
        try {
            await deleteDoc(doc(db, 'files', `${uid}_${fileName}`));
        } catch (error) {
            console.error('Error deleting file document:', error);
            throw error;
        }
    }, []);

    const removeFileFromUserDocument = useCallback(async (uid: string, fileId: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.error('User document not found:', uid);
                return;
            }

            const userData = userDoc.data();
            const currentFiles = userData.files || [];

            const fileIndex = currentFiles.findIndex((file: FileData) => file.id === fileId);
            if (fileIndex === -1) {
                console.warn('File not found in user document:', fileId);
                return;
            }

            // 削除対象のファイルを除外した新しい配列を作成
            const updatedFiles = [
                ...currentFiles.slice(0, fileIndex),
                ...currentFiles.slice(fileIndex + 1),
            ];

            // 更新された配列でユーザードキュメントを更新
            await updateDoc(userRef, { files: updatedFiles });
            console.log('File successfully removed from user document:', fileId);
        } catch (error) {
            console.error('Error removing file from user document:', error);
            throw error as FirestoreError;
        }
    }, []);

    const deleteAllUserFiles = useCallback(async (userId: string) => {
        try {
            const filesRef = collection(db, 'files');
            const q = query(
                filesRef,
                where('__name__', '>=', `${userId}_`),
                where('__name__', '<', `${userId}_\uf8ff`)
            );

            const querySnapshot = await getDocs(q);

            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // バッチ操作を実行
            await batch.commit();

            // ユーザードキュメントからファイル参照を削除
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                files: [],
            });

            console.log(`Deleted ${querySnapshot.size} files for user ${userId}`);
        } catch (error) {
            console.error('Error deleting all user files:', error);
            throw error;
        }
    }, []);

    const deleteAllFirestoreFiles = useCallback(async (userId: string) => {
        const batch = writeBatch(db);
        let filesDeleted = 0;

        try {
            // 1. ユーザードキュメントを取得
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error('User document not found');
            }

            const userData = userDoc.data();
            const userFiles = (userData.files as FileData[]) || [];

            // 2. 各ファイルをバッチ削除に追加
            userFiles.forEach((file) => {
                const fileDocRef = doc(db, 'files', `${userId}_${file.fileName}`);
                batch.delete(fileDocRef);
                filesDeleted++;
            });

            // 3. usersコレクションのfilesフィールドを空配列に更新
            batch.update(userRef, { files: [] });

            // 4. バッチ処理を実行
            await batch.commit();

            console.log(
                `Successfully deleted ${filesDeleted} files and cleared files array for user ${userId}`
            );
        } catch (error) {
            console.error('Error in deleteAllFirestoreFiles:', error);
            throw error as FirestoreError;
        }
    }, []);

    const updateFileSummaryDocument = useCallback(
        async (userId: string, fileName: string, newSummary: string) => {
            try {
                const fileId = `${userId}_${fileName}`;
                const fileRef = doc(db, 'files', fileId);

                // 現在のドキュメントを取得
                const docSnap = await getDoc(fileRef);

                if (docSnap.exists()) {
                    // ドキュメントが存在する場合、新しいsummaryを配列に追加
                    await updateDoc(fileRef, {
                        summaries: arrayUnion({
                            content: newSummary,
                            timestamp: new Date().toISOString(),
                        }),
                    });
                } else {
                    // ドキュメントが存在しない場合、新しいドキュメントを作成
                    await setDoc(fileRef, {
                        summaries: [
                            {
                                content: newSummary,
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    });
                }

                return fileId;
            } catch (error) {
                throw error as FirestoreError;
            }
        },
        []
    );

    // const deleteFileSummary = useCallback(
    //     async (userId: string, fileName: string, summaryIndices: number[]) => {
    //         try {
    //             const fileId = `${userId}_${fileName}`;
    //             const fileRef = doc(db, "files", fileId);

    //             // 現在のドキュメントを取得
    //             const docSnap = await getDoc(fileRef);

    //             if (docSnap.exists()) {
    //                 const data = docSnap.data();
    //                 const summaries = data.summaries || [];

    //                 // 削除対象のサマリーを特定
    //                 const summariesToRemove = summaryIndices
    //                     .filter(
    //                         (index) => index >= 0 && index < summaries.length
    //                     )
    //                     .map((index) => summaries[index]);

    //                 if (summariesToRemove.length > 0) {
    //                     // 複数のサマリーを一度に削除
    //                     await updateDoc(fileRef, {
    //                         summaries: arrayRemove(...summariesToRemove),
    //                     });
    //                     return true;
    //                 } else {
    //                     console.error("有効な削除対象が見つかりません");
    //                     return false;
    //                 }
    //             } else {
    //                 console.error("指定されたドキュメントが存在しません");
    //                 return false;
    //             }
    //         } catch (error) {
    //             console.error("サマリー削除中にエラーが発生しました:", error);
    //             throw error as FirestoreError;
    //         }
    //     },
    //     []
    // );

    return {
        loading,
        error,
        addDocument,
        addFileToUserDocument,
        getUserFileList,
        clearCache,
        getViewFile,
        subscribeToUserFiles,
        deleteFileDocument,
        deleteAllUserFiles,
        removeFileFromUserDocument,
        updateFileSummaryDocument,
        // deleteFileSummary,
        deleteAllFirestoreFiles,
    };
};
