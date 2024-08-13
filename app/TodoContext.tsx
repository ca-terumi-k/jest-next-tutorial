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
    todos: Todo[] | null;
    setTodos: React.Dispatch<React.SetStateAction<Todo[] | null>>;
    updateTodo: (updatedTodo: Todo) => void;
    addTodo: (newTodo: Omit<Todo, "id">) => void;
    deleteTodo: (id: number) => void;
    isLoading: boolean;
    getTags: () => string[];
}

export const TodoContext = createContext<TodoContextType | undefined>(
    undefined
);

const defaultTodos: Todo[] = [
    {
        id: 1,
        title: "React Hooksのリファクタリング",
        completed: false,
        createdAt: "2024-08-02",
        completedAt: null,
        priority: "High",
        tags: ["React", "リファクタリング"],
    },
    {
        id: 2,
        title: "CSSアニメーションの最適化",
        completed: true,
        createdAt: "2024-08-03",
        completedAt: "2024-08-05",
        priority: "Medium",
        tags: ["CSS", "パフォーマンス"],
    },
    {
        id: 3,
        title: "TypeScriptの型定義の見直し",
        completed: false,
        createdAt: "2024-08-04",
        completedAt: null,
        priority: "High",
        tags: ["TypeScript"],
    },
    {
        id: 4,
        title: "Webpack設定の最適化",
        completed: false,
        createdAt: "2024-08-05",
        completedAt: null,
        priority: "Medium",
        tags: ["Webpack", "ビルド最適化"],
    },
    {
        id: 5,
        title: "Jest単体テストの追加",
        completed: false,
        createdAt: "2024-08-06",
        completedAt: null,
        priority: "Medium",
        tags: ["テスト", "Jest"],
    },
    {
        id: 6,
        title: "アクセシビリティ改善",
        completed: false,
        createdAt: "2024-08-07",
        completedAt: null,
        priority: "High",
        tags: ["a11y", "WCAG"],
    },
    {
        id: 7,
        title: "レスポンシブデザインの修正",
        completed: true,
        createdAt: "2024-08-08",
        completedAt: "2024-08-10",
        priority: "High",
        tags: ["CSS", "レスポンシブ"],
    },
    {
        id: 8,
        title: "GraphQL APIの実装",
        completed: false,
        createdAt: "2024-08-09",
        completedAt: null,
        priority: "Medium",
        tags: ["GraphQL", "API"],
    },
    {
        id: 9,
        title: "Storybook コンポーネントの追加",
        completed: false,
        createdAt: "2024-08-10",
        completedAt: null,
        priority: "Low",
        tags: ["Storybook", "コンポーネント"],
    },
    {
        id: 10,
        title: "パフォーマンス最適化",
        completed: false,
        createdAt: "2024-08-11",
        completedAt: null,
        priority: "High",
        tags: ["パフォーマンス", "最適化"],
    },
];

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [todos, setTodos] = useState<Todo[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeTodos = () => {
            const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!storedTodos) {
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify(defaultTodos)
                );
                setTodos(defaultTodos);
            } else {
                setTodos(JSON.parse(storedTodos));
            }
            setIsLoading(false);
        };

        initializeTodos();
    }, []);

    useEffect(() => {
        if (todos !== null) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
        }
    }, [todos]);

    const updateTodo = useCallback((updatedTodo: Todo) => {
        setTodos((prevTodos) =>
            prevTodos
                ? prevTodos.map((todo) =>
                      todo.id === updatedTodo.id ? updatedTodo : todo
                  )
                : null
        );
    }, []);

    const addTodo = useCallback((newTodo: Omit<Todo, "id">) => {
        setTodos((prevTodos) => {
            if (!prevTodos) return [{ ...newTodo, id: 1 }];
            const newId = Math.max(...prevTodos.map((t) => t.id)) + 1;
            return [...prevTodos, { ...newTodo, id: newId }];
        });
    }, []);

    const deleteTodo = useCallback((id: number) => {
        setTodos((prevTodos) =>
            prevTodos ? prevTodos.filter((todo) => todo.id !== id) : null
        );
    }, []);

    const getTags = useCallback(() => {
        if (!todos) return [];
        const tagSet = new Set<string>();
        todos.forEach((todo) => {
            if (todo.tags) {
                todo.tags.forEach((tag) => tagSet.add(tag));
            }
        });
        return Array.from(tagSet);
    }, [todos]);

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
                isLoading,
                getTags,
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
    const { todos, isLoading } = useTodo();

    return useMemo(
        () => ({
            totalTodos: todos?.length ?? 0,
            completedTodos: todos?.filter((todo) => todo.completed).length ?? 0,
            userName,
            currentDate: new Date(),
            isLoading,
        }),
        [todos, userName, isLoading]
    );
};
