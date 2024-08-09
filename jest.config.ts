import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    dir: "./",
});

const config: Config = {
    coverageProvider: "v8",
    testEnvironment: "jest-environment-jsdom",
    // Add more setup options before each test is run
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testEnvironmentOptions: {
        env: {
            // ここに.env.localの内容を直接記述
            HELLO_WORLD: "Hello, World!",
        },
    },
};

export default createJestConfig(config);
