import React, { useState } from "react";
import { AnimatePresence, motion, PanInfo, useAnimation } from "framer-motion";
import { Todo } from "@/types/Todo";
import { Trash2, CheckCircle, CircleDashed } from "lucide-react";

export default function TodoItem({
    todo,
    onDelete,
    onComplete,
}: {
    todo: Todo;
    onDelete: (id: number) => void;
    onComplete: (id: number) => void;
}) {
    const controls = useAnimation();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = async (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        const threshold = 100;
        if (info.offset.x < -threshold) {
            if (todo.id) {
                try {
                    await controls.start({ x: "-100%", opacity: 0 });
                    onDelete(todo.id);
                } catch (err) {
                    console.error(err);
                    controls.start({ x: 0, opacity: 1 });
                }
            }
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
        setIsDragging(false);
    };

    const handleComplete = () => {
        if (todo.id) {
            onComplete(todo.id);
        }
    };

    const handleDelete = async () => {
        try {
            await controls.start({ x: "-100%", opacity: 0 });
            onDelete(todo.id);
        } catch (err) {
            console.error(err);
            controls.start({ x: 0, opacity: 1 });
        }
    };

    return (
        <motion.li
            drag="x"
            dragDirectionLock
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            animate={controls}
            className={`bg-white shadow-md p-4 hover:shadow-lg transition duration-300 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
            } flex items-center justify-between`}
        >
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleComplete()}
                className={`p-3 rounded-full ${
                    todo.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                } transition duration-300 ml-2 mr-4 relative`}
                data-testid={`toggleBtn_${todo.id}`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={todo.completed ? "completed" : "uncompleted"}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {todo.completed ? (
                            <CheckCircle size={20} data-icon="check-circle" />
                        ) : (
                            <CircleDashed size={20} data-icon="circle-dashed" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {todo.title}
                    </h3>
                    <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                            todo.priority === "low"
                                ? "bg-green-200 text-green-800"
                                : todo.priority === "medium"
                                ? "bg-yellow-200 text-yellow-800"
                                : todo.priority === "high"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        {todo.priority}
                    </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    <p>作成日: {new Date(todo.createdAt).toLocaleString()}</p>
                    {todo.completedAt && (
                        <p>
                            完了日:{" "}
                            {new Date(todo.completedAt).toLocaleString()}
                        </p>
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
            </div>
            <div className="flex items-center ml-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300"
                    data-testid={`deleteBtn_${todo.id}`}
                >
                    <Trash2 size={18} />
                </motion.button>
            </div>
        </motion.li>
    );
}
