"use client";
import React, { useMemo, useState } from "react";
import { Todo } from "@/types/Todo";
import TodoItem from "@/app/components/TodoItem";
import Toast from "@/app/components/Toast";
import { useTodo } from "@/app/TodoContext";
import { ChevronDown } from "lucide-react";

type FilterType = "all" | "completed" | "active";
type SortType = "createdAt" | "priorityAsc" | "priorityDesc";

export default function TodoList() {
    const { todos, updateTodo, deleteTodo, isLoading, getTags } = useTodo();
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortType>("createdAt");

    const handleDelete = (id: number) => {
        try {
            deleteTodo(id);
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
        const todoToUpdate = todos?.find((todo) => todo.id === id);
        if (todoToUpdate) {
            const updatedTodo = {
                ...todoToUpdate,
                completed: !todoToUpdate.completed,
            };
            updateTodo(updatedTodo);
        }
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
    };

    const handleTagFilterChange = (tag: string | null) => {
        setTagFilter(tag);
    };

    const filteredAndSortedTodos = useMemo(() => {
        if (!todos) return [];
        return todos
            .filter((todo) => {
                const matchesCompletionFilter =
                    filter === "all" ||
                    (filter === "completed" && todo.completed) ||
                    (filter === "active" && !todo.completed);

                const matchesTagFilter =
                    !tagFilter || (todo.tags && todo.tags.includes(tagFilter));

                return matchesCompletionFilter && matchesTagFilter;
            })
            .sort((a, b) => {
                if (sortBy === "priorityAsc" || sortBy === "priorityDesc") {
                    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                    const comparison =
                        priorityOrder[a.priority] - priorityOrder[b.priority];
                    return sortBy === "priorityAsc" ? comparison : -comparison;
                } else if (sortBy === "createdAt") {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                }
                return 0;
            });
    }, [todos, filter, tagFilter, sortBy]);

    const availableTags = useMemo(() => {
        if (!todos) return [];
        const tags = new Set<string>();
        todos.forEach((todo) => {
            if (todo.tags) {
                todo.tags.forEach((tag) => tags.add(tag));
            }
        });
        return Array.from(tags);
    }, [todos]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!todos) {
        return <div>No todos available</div>;
    }

    return (
        <div className="container mx-auto p-4 overflow-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-wrap gap-2" data-testid="filter_btn">
                    {["all", "active", "completed"].map((filterType) => (
                        <button
                            key={filterType}
                            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                                filter === filterType
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() =>
                                handleFilterChange(filterType as FilterType)
                            }
                        >
                            {filterType === "all"
                                ? "全て"
                                : filterType === "active"
                                ? "未完了"
                                : "完了"}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 leading-tight focus:outline-none focus:border-blue-500 transition-colors duration-200"
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDown size={20} />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 leading-tight focus:outline-none focus:border-blue-500 transition-colors duration-200"
                            onChange={(e) => setSortBy(e.target.value)}
                            value={sortBy}
                        >
                            <option value="createdAt">作成日順</option>
                            <option value="priorityDesc">
                                優先度（高 → 低）
                            </option>
                            <option value="priorityAsc">
                                優先度（低 → 高）
                            </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <ul className="space-y-4">
                {filteredAndSortedTodos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onComplete={() => handleComplete(todo.id)}
                        onDelete={() => handleDelete(todo.id)}
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
