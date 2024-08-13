"use client";
import React from "react";
import TodoHeader from "@/app/components/TodoHeader";
import TodoList from "@/app/components/TodoList";
import { TodoProvider, useTodo, useTodoHeader } from "@/app/TodoContext";
import AddTodoForm from "@/app/components/AddTodoForm";

export default function Home() {
    return (
        <TodoProvider>
            <TodoContent />
        </TodoProvider>
    );
}

function TodoContent() {
    const { todos, updateTodo } = useTodo();
    const headerProps = useTodoHeader("Mr. Todo");

    return (
        <div className="h-screen flex flex-col">
            <div className="flex-shrink-0">
                <TodoHeader {...headerProps} />
            </div>
            <div className="flex-grow overflow-auto">
                <div className="max-w-4/5 mx-auto">
                    <TodoList />
                </div>
                <div className="fixed bottom-0 right-0 p-4">
                    <AddTodoForm />
                </div>
            </div>
        </div>
    );
}