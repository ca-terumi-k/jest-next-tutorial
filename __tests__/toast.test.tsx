import React from "react";
import { render, screen } from "@testing-library/react";
import Toast from "@/app/components/Toast";

describe("Toast component", () => {
    type TestCase = {
        type: "success" | "error" | "info";
        message: string;
    };
    const testCases: TestCase[] = [
        { type: "success", message: "This is a success message" },
        { type: "error", message: "This is an error message" },
        { type: "info", message: "This is an info message" },
    ];

    test.each(testCases)(
        "renders $type toast with correct message",
        ({ type, message }) => {
            render(<Toast message={message} type={type} onClose={() => {}} />);
            expect(screen.getByText(message)).toBeInTheDocument();
        }
    );
});
