"use client";
import React, { useState, useEffect } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-8 right-28 px-4 py-2 rounded-md text-white ${
                type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
            {message}
        </div>
    );
};

export default Toast;
