import React from "react";
import { render, screen } from "@testing-library/react";
import Sample from "@/app/components/Sample";
import { describe } from "node:test";

describe("Sample component", () => {
    test("<Sample /> の div にテキストが入っていることを確認", () => {
        render(<Sample />);
        const element = screen.getByText("Hello World");
        expect(element).toBeInTheDocument();
    });
});
