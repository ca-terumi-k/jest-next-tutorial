"use client";
import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { Todo } from "@/types/Todo";
import { TodoHeaderProps } from "@/app/components/TodoHeader";

const LOCAL_STORAGE_KEY = "todos";

export interface TodoContextType {
    toggleTodo(toggleTodo: any): unknown;
    setFilter(setFilter: any): unknown;
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
    updateTodo: (updatedTodo: Todo) => void;
    addTodo: (newTodo: Omit<Todo, "id">) => void;
    deleteTodo: (id: number) => void;
}

export const TodoContext = createContext<TodoContextType | undefined>(
    undefined
);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [todos, setTodos] = useState<Todo[]>([]);

    // クライアントサイドでのみ localStorage からデータを読み込む
    useEffect(() => {
        const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos) as Todo[]);
        }
    }, []);

    // todos の変更を監視し、localStorage に保存
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const updateTodo = useCallback((updatedTodo: Todo) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo) =>
                todo.id === updatedTodo.id ? updatedTodo : todo
            )
        );
    }, []);

    const addTodo = useCallback((newTodo: Omit<Todo, "id">) => {
        setTodos((prevTodos) => {
            const newId =
                prevTodos.length > 0
                    ? Math.max(...prevTodos.map((t) => t.id)) + 1
                    : 1;
            return [...prevTodos, { ...newTodo, id: newId }];
        });
    }, []);

    const deleteTodo = useCallback((id: number) => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }, []);

    return (
        <TodoContext.Provider
            value={{
                todos,
                setTodos,
                updateTodo,
                addTodo,
                deleteTodo,
                toggleTodo: () => {},
                setFilter: () => {},
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (context === undefined) {
        throw new Error("useTodo must be used within a TodoProvider");
    }
    return context;
};

export const useTodoHeader = (userName: string): TodoHeaderProps => {
    const { todos } = useTodo();

    return useMemo(
        () => ({
            totalTodos: todos.length,
            completedTodos: todos.filter((todo) => todo.completed).length,
            userName,
            currentDate: new Date(),
        }),
        [todos, userName]
    );
};
