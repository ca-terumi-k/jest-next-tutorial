"use server";

import { storage, bucket, auth } from "@/lib/firebase/admin";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import logger from "@/app/logger";

interface ActionInput {
    userId: string;
    fileName: string;
}

interface ActionOutput {
    flag: number;
    signedUrl?: string;
    error?: string;
    details?: string;
}

interface UploadResult {
    error?: string;
    status?: number;
    message?: string;
    url?: string;
}

export async function generateSignedUrl(
    input: ActionInput
): Promise<ActionOutput> {
    try {
        const { userId, fileName } = input;

        if (!userId || !fileName) {
            return { flag: 0, error: "userId and fileName are required" };
        }

        const filePath = `uploads/${userId}/${fileName}`;
        const bucket = storage.bucket();

        const [exists] = await bucket.file(filePath).exists();
        if (!exists) {
            logger.debug(`File not found: ${filePath}`);
            return { flag: 0, error: "File not found" };
        }

        const [signedUrl] = await bucket.file(filePath).getSignedUrl({
            action: "read",
            expires: Date.now() + 1 * 60 * 1000, // 1分間有効
        });

        return { flag: 1, signedUrl: signedUrl };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return {
            flag: 0,
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function uploadFiles(
    prevState: unknown,
    formData: FormData
): Promise<UploadResult> {
    let tempFilePath = "";

    try {
        // セッションの検証
        const session = await auth.verifySessionCookie(
            prevState as string,
            true
        );
        if (!session) {
            return { error: "Unauthorized", status: 401 };
        }

        const userId = session.uid;
        const file = formData.get("file") as File | null;

        if (!file) {
            return { error: "No file uploaded", status: 400 };
        }

        if (!file.type.startsWith("application/pdf")) {
            return { error: "Only PDF files are allowed", status: 400 };
        }

        if (file.size > 5 * 1024 * 1024) {
            return { error: "File size exceeds 5MB limit", status: 400 };
        }

        tempFilePath = join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(tempFilePath, buffer);

        const destination = `uploads/${userId}/${file.name}`;
        await bucket.upload(tempFilePath, {
            destination: destination,
            metadata: {
                contentType: file.type || "application/octet-stream",
            },
        });

        const [url] = await bucket.file(destination).getSignedUrl({
            action: "read",
            expires: "03-01-2500",
        });

        return { message: "File uploaded successfully", url };
    } catch (error) {
        console.error("Upload error:", error);
        if (
            error instanceof Error &&
            error.message.includes("Missing or insufficient permissions")
        ) {
            return {
                error: "Permission denied. Please check your authentication.",
                status: 403,
            };
        }
        return { error: "Failed to upload file", status: 500 };
    } finally {
        try {
            await unlink(tempFilePath);
        } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
        }
    }
}