export type Priority = "high" | "medium" | "low";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    completedAt: string;
    priority: Priority;
    tags: string[];
}
