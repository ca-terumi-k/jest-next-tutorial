// TodoHeader.tsx
import React from "react";

export type TodoHeaderProps = {
    totalTodos: number;
    completedTodos: number;
    userName: string;
    currentDate: Date;
};

export default function TodoHeader({
    totalTodos,
    completedTodos,
    userName,
    currentDate,
}: TodoHeaderProps) {
    const remainingTodos = totalTodos - completedTodos;

    return (
        <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-2">Todo リスト</h1>
                <p className="text-lg">こんにちは、{userName}さん</p>
                <p className="text-sm">{currentDate.toLocaleDateString()}</p>
                <div className="mt-4 flex justify-between">
                    <span>総タスク数: {totalTodos}</span>
                    <span>完了: {completedTodos}</span>
                    <span>残り: {remainingTodos}</span>
                </div>
            </div>
        </header>
    );
}
