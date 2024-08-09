// TodoList.tsx
"use client";
import React, { useState } from "react";
import { Todo } from "@/types/Todo";
import TodoItem from "@/app/components/TodoItem";
import Toast from "@/app/components/Toast";

export default function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
    const [todos, setTodos] = useState(initialTodos);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);

    const handleDelete = (id: number) => {
        try {
            // タスクを削除します
            setTodos(todos.filter((todo) => todo.id !== id));
            setToast({
                message: "タスクが正常に削除されました",
                type: "success",
            });
        } catch (error) {
            console.error("削除中にエラーが発生しました:", error);
            setToast({
                message: "タスクの削除中にエラーが発生しました",
                type: "error",
            });
        }
    };

    return (
        <div className="container mx-auto p-4 overflow-auto">
            <ul className="space-y-4">
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onDelete={handleDelete}
                    />
                ))}
            </ul>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
