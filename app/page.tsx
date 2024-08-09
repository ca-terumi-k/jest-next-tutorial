import React from "react";
import TodoList from "@/app/components/TodoList";
import { Todo } from "@/types/Todo";

const todos: Todo[] = [
    {
        id: 1,
        title: "Create a new project",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "high",
        tags: ["react", "typescript"],
    },
    {
        id: 2,
        title: "Add Tailwind CSS",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "medium",
        tags: ["tailwindcss"],
    },
    {
        id: 3,
        title: "Write tests",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "low",
        tags: ["jest", "testing-library"],
    },
];

export default function Home() {
    return (
        <>
            <div className="max-w-4/5">
                <TodoList todos={todos} />
            </div>
        </>
    );
}
