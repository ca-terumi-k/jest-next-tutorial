import React from "react";
import TodoHeader from "@/app/components/TodoHeader";
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
    {
        id: 4,
        title: "Deploy the app",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "medium",
        tags: ["vercel"],
    },
    {
        id: 5,
        title: "Write documentation",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "low",
        tags: ["docs"],
    },
];

const headerProps = {
    totalTodos: todos.length,
    completedTodos: 0,
    userName: "John Doe",
    currentDate: new Date(),
};

export default function Home() {
    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="flex-shrink-0">
                    <TodoHeader {...headerProps} />
                </div>
                <div className="flex-grow overflow-auto">
                    <div className="max-w-4/5 mx-auto">
                        <TodoList todos={todos} />
                    </div>
                </div>
            </div>
        </>
    );
}
