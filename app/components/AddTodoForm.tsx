import React, { useState } from "react";
import { useTodo } from "@/app/TodoContext";
import { Todo, Priority } from "@/types/Todo";

const priorityOptions: Priority[] = ["Low", "Medium", "High"];

export default function AddTodoForm() {
    const { addTodo, getTags } = useTodo();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Todo["priority"]>("Medium");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");

    const availableTags = getTags();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            const newTodo: Omit<Todo, "id"> = {
                title: title.trim(),
                createdAt: new Date().toISOString(),
                priority,
                tags: tags, // タグの配列をそのまま使用
                completed: false,
                completedAt: null,
            };
            addTodo(newTodo);
            setTitle("");
            setPriority("Medium");
            setTags([]);
            setIsOpen(false);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Add Todo
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Todo</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="title"
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    aria-label="Title"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="priority"
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    aria-label="Priority"
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(
                                            e.target.value as Todo["priority"]
                                        )
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {priorityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="tags"
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Tags
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        id="tags"
                                        aria-label="New Tag"
                                        value={newTag}
                                        onChange={(e) =>
                                            setNewTag(e.target.value)
                                        }
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Add a tag"
                                        list="availableTags"
                                    />
                                    <datalist id="availableTags">
                                        {availableTags.map((tag) => (
                                            <option key={tag} value={tag} />
                                        ))}
                                    </datalist>
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        aria-label="Add Tag"
                                        className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded flex items-center"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveTag(tag)
                                                }
                                                className="ml-1 text-blue-800 hover:text-blue-900"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    aria-label="Add"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}