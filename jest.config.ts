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
            NEXT_PUBLIC_FIREBASE_API_KEY:
                "AIzaSyBqgGpbCrGF1E3XsfoW5oZJXL1zzJXzQEs",
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
                "ca-frontend-fy24-onb-terumi.firebaseapp.com",
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: "ca-frontend-fy24-onb-terumi",
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
                "ca-frontend-fy24-onb-terumi.appspot.com",
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "925211094374",
            NEXT_PUBLIC_FIREBASE_APP_ID:
                "1:925211094374:web:fb73bd9b8829a65a61eca7",
            NEXT_PUBLIC_BASIC_SETTING: "false",
            NEXT_PUBLIC_BASIC_USER: "test",
            NEXT_PUBLIC_BASIC_PASSWORD: "fy24-gen",
            OPENAI_API_KEY:
                "sk-proj-PgZd8eTBxsqVWxBw5LynT3BlbkFJSs6dAHYrTUozJTAZrjfu",
            FIREBASE_PRIVATE_KEY:
                "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtV7KIfIMt8iqJ\njckHAfPktAO6gf5X/YqdUE4awrv7KakDkGzObA/8ljD08KKqJ5nQVQXaQMrhaUSS\nVfndLaj78QYjcP6oENQaozKzLRlcJCzjzc1yGPwubpIKP2z94kHUr118w+puuvbR\nqzs3GVioW7l4EFROrmygfBcZQ77QTTM+0eCR2c/J5VWSMENltq6xwR/xB7CDtUcm\nDFJXDfq4UhZx+RnQXlW1qkiIeSx+8NtZhi2wyKDq9Cjs5QAgJs/StT3Lkc/w6+le\nTKOHVAZXzi1E3kWVgf/zkxBivd0xKRr1idkTdP9IutU3ZBopzh3OPGDCDVF0owhH\nHjMehL3FAgMBAAECggEAVimBVNaPXgdBnZ4cjp8p3ESeldaH1rTwccG5ERQ63F2Y\n5WykqPaN+7+sFhSGxo1op2WbwyDxt5nbu+GAkbBgjtr/ch54dpHm3FbCnM2ODX7t\n0U47ELvanjnX3cApLQmKL237ykiX/vJwPUgf5wNyTj1Js6RqQ7HvzNXhpW1HK8Jg\nYSqp9zp5D8ZUQXBWe1ClKSBXTqTi8AQOle/4t01d88gVOMZ2uxIQj6TXiB7qDr3b\nNyUSnik/Kz1mk3jyTeG8J5ibeq8M3VxHUMbuqFwjwlcImqyCdN0cowqTYw103XLS\nZSj34dHpoHmj/fa4dqkPR7rgXwPsKGqzkYrFRia/AQKBgQDzLsioWL50RMLQWct9\nJPvzLfgNDBQYXIEPh1letNSYH9ZnqG1vsfAVSwuyYzuRazkZsUPZLy43b6FZZqcM\nsy2EJ4BvYjrgsWFYqOMBn/60dtvJf15POdtD3JtLureoQeDGcaHm9wqcWImVZ0jD\nInhfn8NcO+lxiGNtr2ql1QKM4wKBgQC2epLwicuDLB42sxOcqwv0ZZC9hu4s3HYd\nQyyMuU/ZyPhXxU3ugfHurJa8BB8I3RX7FGPzaX6E+5oWz2yt9yByUoZCcM0RWd/H\nLQCFXfGkH1pp605x0hlE49yvLItMvS3NCLhwxNNplWKAwlE7AouC9A0SZyzXBjjY\nfA1mbV/zNwKBgEZVsq2WNUeVl68BOayxZLm6AvNrGejN4HooUH3m2VJCaxXCDhzv\nHxxZf0GSF+mAVJyMu632Smy4ObeMzCYNMM33SttsUtEoHJqzBi0zJEz3z6vgzdsm\nRbfD95qYn4PnweZDeWs+6m+739c5bz8ZGi22HJ/xqBwxMWjJApSCHmG3AoGARg9l\nnyiolGI573Jt0zbwzhK4sau+gkbaqn2B+z2i5ND+WGSOeUY25xYogWNrrvGDYPUB\nMxGL2+7lyGA3L8u0D3CTz6qTcVf6TPSAQLRC9Gp9QjFv2s95mDOMJU2K5hm0HgZ9\nGf7X1K/gM+NnYKqnec3NvwUR+DSRWry2QF85+Z0CgYEA1M4zBu7ahxr27UP6VePI\nCj+1N7EkkbFNie7RiirZ8jFgGhhpcQUoWl9stBqjn7/KVtrVHc+N1MYD7WwH4NQ+\nvPXirt66k5cSupGiGBiC1WffKb+s7J6nLUiibJrKWE0cQEyNNKVFRg51g2fJCOBf\noTkFS8FDhX2F28OtQnQYm5Q=\n-----END PRIVATE KEY-----\n",
            FIREBASE_CLIENT_EMAIL:
                "firebase-adminsdk@service-account-manage.iam.gserviceaccount.com",
        },
    },
};

export default createJestConfig(config);
