import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddTodoForm from "@/app/components/AddTodoForm";
import { Todo, Priority } from "@/types/Todo";
import { useTodo } from "@/app/TodoContext";

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

    it("「追加」ボタンが表示されることを確認する", () => {});

    it("「追加」ボタンをクリックするとフォームが開くことを確認する", () => {});

    it("有効なデータでフォームを送信できることを確認する", () => {});

    it("タイトルが空欄の場合、フォームを送信できないことを確認する", () => {});

    it("タグリストに新しいタグを追加できることを確認する", () => {});

    it("重複したタグを追加できないことを確認する", () => {});

    it("タグリストからタグを削除できることを確認する", () => {});
});
