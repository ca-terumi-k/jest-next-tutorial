import React, { useState } from "react";
import { AnimatePresence, motion, PanInfo, useAnimation } from "framer-motion";
import { Todo } from "@/types/Todo";
import { Trash2, CheckCircle, CircleDashed } from "lucide-react";
import { useTodo } from "@/app/TodoContext";

export default function TodoItem({
    todo,
    onComplete,
    onDelete,
}: {
    todo: Todo;
    onComplete: (id: number) => void;
    onDelete: () => void;
}) {
    const controls = useAnimation();
    const { deleteTodo } = useTodo();
    const [isDragging, setIsDragging] = useState(false);
    const [isCompleted, setIsCompleted] = useState(todo.completed);

    const handleDragEnd = async (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        const threshold = 100;
        if (info.offset.x < -threshold) {
            if (todo.id) {
                try {
                    await controls.start({ x: "-100%", opacity: 0 });
                    deleteTodo(todo.id);
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

    const handleComplete = (id: number) => {
        if (!id) return; // IDがない場合に早期終了
        if (todo.id !== id) return; // todoが見つからない場合に終了
        // 更新処理
        onComplete(id);
        setIsCompleted(!isCompleted);
    };
    
    const handleDelete = async () => {
        try {
            await controls.start({ x: "-100%", opacity: 0 });
            onDelete();
        } catch (err) {
            console.error(err);
            await controls.start({ x: 0, opacity: 1 }); // 元に戻す
        }
    };

    

    return (
        <motion.li
            drag="x"
            dragDirectionLock
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            animate={controls}
            className={`bg-gray-50 shadow-md p-4 hover:shadow-lg transition duration-300 flex items-center justify-between
                ${isDragging ? "cursor-grabbing" : "cursor-grab"}  ${
                todo.completed ? "opacity-50" : ""
            }`}
            data-testid="todo_item"
        >
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleComplete(todo.id)}
                className={`p-3 rounded-full ${
                    todo.completed
                        ? "bg-green-700 text-white hover:bg-green-800" // 高コントラスト
                        : "bg-blue-600 text-white hover:bg-blue-700" // 高コントラスト
                } transition duration-300 ml-2 mr-4 relative`}
                data-testid={`toggleBtn_${todo.id}`}
                aria-label={todo.completed ? "Mark as uncompleted" : "Mark as completed"}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={todo.completed ? "completed" : "uncompleted"}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        {todo.completed ? <CheckCircle size={20} /> : <CircleDashed size={20} />}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
            <div className="flex-grow">
                {/* セクションを意味づけるために<article>を使用 */}
                <article>
                    <header className="flex justify-between items-center">
                        {/* <h4>を適切な見出し階層の<h2>や<h3>に変更 */}
                        <h3 className="font-semibold text-gray-900">{todo.title}</h3>
                        <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                                todo.priority === "Low"
                                    ? "bg-green-500 text-white" // 明るめの緑
                                    : todo.priority === "Medium"
                                    ? "bg-yellow-500 text-black" // 明るめの黄色
                                    : todo.priority === "High"
                                    ? "bg-red-500 text-white" // 明るめの赤
                                    : "bg-gray-500 text-white" // 明るめの灰色
                            }`}
                        >
                            {todo.priority}
                        </span>
                    </header>

                    {/* 内容部分は<main>や<time>を適切に使用 */}
                    <motion.div
                        className="mt-2 text-sm text-gray-700"
                        data-testid="date"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <p>
                            {isCompleted ? (
                                <span>
                                    完了日: {todo.completedAt ?? "不明"}
                                </span>
                            ) : (
                                <span>
                                    作成日: {todo.createdAt ?? "不明"}
                                </span>
                            )}
                        </p>
                    </motion.div>

                    {/* タグリストを意味づけるため<aside>を使用 */}
                    {todo.tags.length > 0 && (
                        <aside className="mt-2">
                            {todo.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </aside>
                    )}
                </article>
            </div>
            <div className="flex items-center ml-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                    data-testid={`deleteBtn_${todo.id}`}
                    aria-label={`Delete todo item`}
                >
                    <Trash2 size={18} />
                </motion.button>
            </div>
        </motion.li>
    );
}
