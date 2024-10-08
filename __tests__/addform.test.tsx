import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddTodoForm from "@/app/components/AddTodoForm";
import { Todo, Priority } from "@/types/Todo";
import { useTodo } from "@/app/TodoContext";

type Todoemitoutid = Omit<Todo, "id">;

jest.mock("@/app/TodoContext", () => ({
    useTodo: jest.fn(() => ({
        addTodo: jest.fn(),
        getTags: jest.fn(() => ["work", "home"]),
    })),
}));

describe("AddTodoForm", () => {
    beforeEach(() => {
        // モック関数の初期化
        (useTodo as jest.Mock).mockClear();
    });

    it("「追加」ボタンが表示されることを確認する", () => {
        render(<AddTodoForm />);
        expect(screen.getByRole("button", { name: "Add Todo" }))
            .toBeInTheDocument;
    });

    it("「追加」ボタンをクリックするとフォームが開くことを確認する", () => {
        render(<AddTodoForm />);
        fireEvent.click(screen.getByRole("button", { name: "Add Todo" }));
        expect(screen.getByText("Add New Todo")).toBeInTheDocument;
    });

    it("有効なデータでフォームを送信できることを確認する", () => {
        render(<AddTodoForm />);
        fireEvent.click(screen.getByRole("button", { name: "Add Todo" }));

        // タイトルを入力
        const titleInput = screen.getByLabelText("Title");
        fireEvent.change(titleInput, { target: { value: "New Todo" } });

        // 優先度を選択
        const prioritySelect = screen.getByLabelText("Priority");
        fireEvent.change(prioritySelect, { target: { value: "High" } });

        // タグを追加
        const tagInput = screen.getByPlaceholderText("Add a tag");
        fireEvent.change(tagInput, { target: { value: "work" } });
        fireEvent.click(screen.getByRole("button", { name: "Add Tag" }));

        fireEvent.click(screen.getByLabelText("Add"));

        expect(useTodo().addTodo).toHaveBeenCalledWith(
            expect.objectContaining<Todoemitoutid>({
                title: (titleInput as HTMLInputElement).value,
                priority: (prioritySelect as HTMLSelectElement)
                    .value as Priority,
                tags: ["work"], // タグの追加ロジックに依存
                completed: false,
                completedAt: null,
                createdAt: expect.any(String),
            })
        );
    });

    it("タイトルが空欄の場合、フォームを送信できないことを確認する", () => {});

    it("タグリストに新しいタグを追加できることを確認する", () => {});

    it("重複したタグを追加できないことを確認する", () => {});

    it("タグリストからタグを削除できることを確認する", () => {});
});
