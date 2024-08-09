import React from "react";
import { Todo } from "@/types/Todo";

export type TodoListProps = {
    todos: Todo[];
};
export default function TodoList({ todos }: TodoListProps) {
    return (
        <div className="container mx-auto p-4">
            <ul className="space-y-4">
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-300"
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
                            <p>
                                作成日:{" "}
                                {new Date(todo.createdAt).toLocaleString()}
                            </p>
                            {todo.completedAt && (
                                <p>
                                    完了日:{" "}
                                    {new Date(
                                        todo.completedAt
                                    ).toLocaleString()}
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
                    </li>
                ))}
            </ul>
        </div>
    );
}
