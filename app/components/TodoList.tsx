// TodoList.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Todo } from "@/types/Todo";
import TodoItem from "@/app/components/TodoItem";
import Toast from "@/app/components/Toast";

export type TodoListProps = {
    todos: Todo[];
};

type FilterType = "all" | "completed" | "active";

export default function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
    const [todos, setTodos] = useState(initialTodos);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [tagFilter, setTagFilter] = useState<string | null>(null);

    const handleDelete = (id: number) => {
        try {
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

    const handleComplete = (id: number) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
    };

    const handleTagFilterChange = (tag: string | null) => {
        setTagFilter(tag);
    };

    const filteredTodos = useMemo(() => {
        return todos.filter((todo) => {
            const matchesCompletionFilter =
                filter === "all" ||
                (filter === "completed" && todo.completed) ||
                (filter === "active" && !todo.completed);

            const matchesTagFilter =
                !tagFilter || (todo.tags && todo.tags.includes(tagFilter));

            return matchesCompletionFilter && matchesTagFilter;
        });
    }, [todos, filter, tagFilter]);

    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        todos.forEach((todo) => {
            if (todo.tags) {
                todo.tags.forEach((tag) => tags.add(tag));
            }
        });
        return Array.from(tags);
    }, [todos]);

    return (
        <div className="container mx-auto p-4 overflow-auto">
            {/* toggleで完了, 未完了のフィルタリングをしたい */}
            <div className="flex">
                <div className="mb-4 space-x-2" data-testid="filter_btn">
                    <button
                        className={`px-4 py-2 rounded-md ${
                            filter === "all"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                        }`}
                        onClick={() => handleFilterChange("all")}
                    >
                        全て
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${
                            filter === "active"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                        }`}
                        onClick={() => handleFilterChange("active")}
                    >
                        未完了
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${
                            filter === "completed"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                        }`}
                        onClick={() => handleFilterChange("completed")}
                    >
                        完了
                    </button>
                </div>
                <div className="mb-4 space-x-2 ml-2">
                    {/* tagを横に並べて選択できるように */}
                    <div className="mb-4">
                        <select
                            className="px-4 py-2 rounded-md border"
                            onChange={(e) =>
                                handleTagFilterChange(e.target.value || null)
                            }
                            value={tagFilter || ""}
                        >
                            <option value="">全てのタグ</option>
                            {availableTags.map((tag) => (
                                <option key={tag} value={tag}>
                                    {tag}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <ul className="space-y-4">
                {filteredTodos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onDelete={handleDelete}
                        onComplete={() => handleComplete(todo.id)}
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
