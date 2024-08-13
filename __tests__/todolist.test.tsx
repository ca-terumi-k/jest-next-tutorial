import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoList, { TodoListProps } from "@/app/components/TodoList";
import { Todo } from "@/types/Todo";
import { TodoContext, TodoContextType } from "@/app/TodoContext";

const todos: Todo[] = [
    {
        id: 1,
        title: "Create a new project",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "High",
        tags: ["react", "typescript"],
    },
    {
        id: 2,
        title: "Add Tailwind CSS",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "Medium",
        tags: ["tailwindcss"],
    },
    {
        id: 3,
        title: "Write tests",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: "",
        priority: "Low",
        tags: ["jest", "testing-library"],
    },
];

const mockTodoContext: TodoContextType = {
    todos: todos,
    setTodos: jest.fn(),
    addTodo: jest.fn((newTodo: Omit<Todo, "id">) => {}),
    updateTodo: jest.fn((updatedTodo: Todo) => {}),
    deleteTodo: jest.fn((id: number) => {}),
    toggleTodo: jest.fn((toggleTodo: any) => {}),
    setFilter: jest.fn((setFilter: any) => {}),
};

const renderWithMockedProvider = (component: React.ReactElement) => {
    return render(
        <TodoContext.Provider value={mockTodoContext}>
            {component}
        </TodoContext.Provider>
    );
};

describe("TodoList component", () => {
    test("renders todos correctly", () => {
        const props: TodoListProps = {
            todos,
            onTodoUpdate: jest.fn(),
        };
        renderWithMockedProvider(<TodoList {...props} />);
        todos.forEach((todo) => {
            expect(screen.getByText(todo.title)).toBeInTheDocument();
        });
    });

    test("renders todos toggle btn correctly", () => {
        const props: TodoListProps = {
            todos,
            onTodoUpdate: jest.fn(),
        };
        renderWithMockedProvider(<TodoList {...props} />);

        todos.forEach((todo) => {
            const toggleBtn = screen.getByTestId(`toggleBtn_${todo.id}`);
            expect(toggleBtn).toBeInTheDocument();

            const icon = toggleBtn.querySelector("svg");
            expect(icon).toHaveAttribute(
                "data-icon",
                todo.completed ? "check-circle" : "circle-dashed"
            );

            fireEvent.click(toggleBtn);
            // expect(mockTodoContext.toggleTodo).toHaveBeenCalledWith(todo.id);
        });
    });

    test("select filter btn", () => {
        const props: TodoListProps = {
            todos,
            onTodoUpdate: jest.fn(),
        };
        renderWithMockedProvider(<TodoList {...props} />);

        const filterBtns = screen
            .getByTestId("filter_btn")
            .querySelectorAll("button");

        expect(filterBtns).toHaveLength(3);

        filterBtns.forEach((btn) => {
            fireEvent.click(btn);

            // setFilterが呼ばれたかどうかを確認
            // expect(mockTodoContext.setFilter).toHaveBeenCalled();

            // ボタンのクラスを確認
            expect(btn).toHaveClass("bg-blue-500");
            expect(btn).toHaveClass("text-white");
        });

        // 全てのボタンについてsetFilterが呼ばれたことを確認
        // expect(mockTodoContext.setFilter).toHaveBeenCalledTimes(3);
    });
});

