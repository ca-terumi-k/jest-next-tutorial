export type Priority = "Low" | "Medium" | "High";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    completedAt: string | null;
    priority: Priority;
    tags: string[];
}
