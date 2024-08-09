// TodoItem component
"use client";
import React, { useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Todo } from "@/types/Todo";

export default function TodoItem({
    todo,
    onDelete,
}: {
    todo: Todo;
    onDelete: (id: number) => void;
}) {
    const controls = useAnimation();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = async (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        const threshold = 100; // スワイプ距離のしきい値
        if (info.offset.x < -threshold) {
            if (todo.id) {
                try {
                    // animationが完了したら、アイテムを削除します
                    await controls.start({ x: "-100%", opacity: 0 });
                    onDelete(todo.id);
                } catch (err) {
                    console.error(err);
                    // 削除に失敗した場合、アイテムを元の位置に戻します
                    controls.start({ x: 0, opacity: 1 });
                }
            }
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
        setIsDragging(false);
    };

    return (
        <motion.li
            drag="x"
            dragDirectionLock
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            animate={controls}
            className={`bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-300 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">
                    {todo.title}
                </h3>
                <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                        todo.priority === "low"
                            ? "bg-green-200 text-green-800"
                            : todo.priority === "medium"
                            ? "bg-yellow-200 text-yellow-800"
                            : todo.priority === "high"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-800"
                    }`}
                >
                    優先度: {todo.priority}
                </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                <p>作成日: {new Date(todo.createdAt).toLocaleString()}</p>
                {todo.completedAt && (
                    <p>完了日: {new Date(todo.completedAt).toLocaleString()}</p>
                )}
            </div>
            {todo.tags.length > 0 && (
                <div className="mt-2">
                    {todo.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </motion.li>
    );
}
