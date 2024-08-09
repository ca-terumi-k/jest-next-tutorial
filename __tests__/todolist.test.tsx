import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoList, { TodoListProps } from "@/app/components/TodoList";
import { Todo } from "@/types/Todo";
import TodoItem from "@/app/components/TodoItem";

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

    test("renders todos toggle btn correctly", () => {
        // 生成されたTodoItemコンポーネント
        const props: TodoListProps = { todos };
        render(<TodoList {...props} />);

        // 生成されたTodoItemコンポーネントのtoggleボタンを取得
        todos.forEach((todo) => {
            const toggleBtn = screen.getByTestId(`toggleBtn_${todo.id}`);
            // toggleボタンが存在することを確認
            expect(toggleBtn).toBeInTheDocument();

            // toggleボタンのアイコンが存在することを確認
            const icon = toggleBtn.querySelector("svg");
            expect(icon).toHaveAttribute(
                "data-icon",
                todo.completed ? "check-circle" : "circle-dashed"
            );

            // toggleボタンのアイコンが正しいことを確認
            if (todo.completed) {
                expect(icon).toHaveAttribute("data-icon", "check-circle");
            } else {
                expect(icon).toHaveAttribute("data-icon", "circle-dashed");
            }

            // toggleボタンをクリック
            fireEvent.click(toggleBtn);

            // toggleボタンのアイコンが正しいことを確認
            if (todo.completed) {
                expect(icon).toHaveAttribute("data-icon", "check-circle");
            } else {
                expect(icon).toHaveAttribute("data-icon", "circle-dashed");
            }
        });
    });
});
