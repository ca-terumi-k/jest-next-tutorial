"use client";
import React, { useCallback, useEffect, useState } from "react";
import TodoHeader, { TodoHeaderProps } from "@/app/components/TodoHeader";
import TodoList from "@/app/components/TodoList";
import { Todo } from "@/types/Todo";

const todos: Todo[] = [
    {
        id: 1,
        title: "Create a new project",
        completed: false,
        createdAt: "2024-08-04",
        completedAt: "",
        priority: "high",
        tags: ["react", "typescript"],
    },
    {
        id: 2,
        title: "Add Tailwind CSS",
        completed: true,
        createdAt: "2024-08-04",
        completedAt: "",
        priority: "medium",
        tags: ["tailwindcss"],
    },
    {
        id: 3,
        title: "Write tests",
        completed: false,
        createdAt: "2024-08-05",
        completedAt: "",
        priority: "low",
        tags: ["jest", "testing-library"],
    },
    {
        id: 4,
        title: "Deploy the app",
        completed: true,
        createdAt: "2024-08-05",
        completedAt: "",
        priority: "medium",
        tags: ["vercel"],
    },
    {
        id: 5,
        title: "Write documentation",
        completed: false,
        createdAt: "2024-08-05",
        completedAt: "",
        priority: "low",
        tags: ["docs"],
    },
];

export default function Home() {
    const [todo, setTodos] = useState<Todo[]>(todos);

    useEffect(() => {
        // クライアントサイドでのみ実行される
        const storedData = localStorage.getItem("myData");
        if (storedData) {
            setTodos(JSON.parse(storedData));
        }
    }, [todo]);

    const [headerProps, setHeaderProps] = useState<TodoHeaderProps>({
        totalTodos: todos.length,
        completedTodos: todos.filter((todo) => todo.completed).length,
        userName: "John Doe",
        currentDate: new Date("2021-09-01"),
    });

    const updateHeaderProps = useCallback(() => {
        return {
            totalTodos: todos.length,
            completedTodos: todos.filter((todo) => todo.completed).length,
            userName: "John Doe",
            currentDate: new Date(),
        };
    }, [todos]);

    useEffect(() => {
        setHeaderProps(updateHeaderProps());
    }, [todos, updateHeaderProps]);

    const handleTodoUpdate = (updatedTodo: Todo) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo) =>
                todo.id === updatedTodo.id ? updatedTodo : todo
            )
        );
    };
    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="flex-shrink-0">
                    <TodoHeader {...headerProps} />
                </div>
                <div className="flex-grow overflow-auto">
                    <div className="max-w-4/5 mx-auto">
                        <TodoList
                            todos={todo}
                            onTodoUpdate={handleTodoUpdate}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
