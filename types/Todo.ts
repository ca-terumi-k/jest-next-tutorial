export type Priority = "Low" | "Medium" | "High";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: Date;
    completedAt: Date | null;
    priority: Priority;
    tags: string[];
}
