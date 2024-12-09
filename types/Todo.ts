export type Priority = "Low" | "Medium" | "High";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: String;
    completedAt: String | null;
    priority: Priority;
    tags: string[];
}
