import React from "react";
import { render, screen } from "@testing-library/react";
import TodoList, { TodoListProps } from "@/app/components/TodoList";
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

describe("TodoList component", () => {
    test("renders todos correctly", () => {
        const props: TodoListProps = { todos };
        render(<TodoList {...props} />);
        todos.forEach((todo) => {
            expect(screen.getByText(todo.title)).toBeInTheDocument();
        });
    });
});
