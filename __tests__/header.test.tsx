import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/app/components/Header"; // Headerコンポーネントのパスを適切に調整してください

test("header menuが配置できているか", () => {
    render(<Header />);
    // aタグが複数あるはず -> getAllByRole
    const nav = screen.getAllByRole("menuitem");
    // navigationの要素を選択
    // 4つのaタグがあるはず
    // 繰り返しでnavを取得して、それぞれの要素が存在するか確認
    nav.forEach((element) => {
        expect(element).toBeTruthy();
    });
});
