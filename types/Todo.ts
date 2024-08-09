export type Todo = {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    completedAt: string;
    priority: "low" | "medium" | "high";
    tags: string[];
};
