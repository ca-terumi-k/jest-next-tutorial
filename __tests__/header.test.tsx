import React from "react";
import { render, screen } from "@testing-library/react";
import TodoHeader, { TodoHeaderProps } from "@/app/components/TodoHeader";
import { Todo } from "@/types/Todo";

const testData: TodoHeaderProps = {
    totalTodos: 3,
    completedTodos: 0,
    userName: "John",
    currentDate: new Date(),
};

describe("Header Component", () => {
    test("Header Component test", () => {
        render(<TodoHeader {...testData} />);
        expect(screen.getByText("Todo リスト")).toBeInTheDocument();
        expect(
            screen.getByText(`こんにちは、${testData.userName}さん`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(testData.currentDate.toLocaleDateString())
        ).toBeInTheDocument();
        expect(
            screen.getByText(`総タスク数: ${testData.totalTodos}`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(`完了: ${testData.completedTodos}`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                `残り: ${testData.totalTodos - testData.completedTodos}`
            )
        ).toBeInTheDocument();
    });
});
