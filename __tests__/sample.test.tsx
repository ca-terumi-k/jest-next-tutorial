import React from "react";
import { render, screen } from "@testing-library/react";
import Sample from "@/app/components/Sample";
import { describe, it } from "node:test";

describe("Sample component", () => {
    it("renders the component correctly", () => {
        render(<Sample />);
        const element = screen.getByText("Enter");
        expect(element).toBeInTheDocument();
    });
});
