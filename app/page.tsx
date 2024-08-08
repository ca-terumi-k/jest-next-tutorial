"use client";
import React from "react";
import Image from "next/image";
import LoginButton from "@/app/components/LoginButton";
import topImage from "@/public/topImage.png";

export default function Home() {
    return (
        <main
            className="h-screen min-h-screen grid grid-cols-5 items-center"
            style={{ backgroundColor: "#CECECE" }}
        >
            <div className="col-span-3">
                <Image
                    src={topImage}
                    width={800}
                    height={600}
                    alt="PDF Summary App"
                    className="w-full h-auto"
                />
            </div>
            <div className="col-span-2 p-8 mx-auto text-center">
                <h1 className="text-4xl font-bold mb-8">PDFBrief</h1>
                <p className="mb-8">
                    Thank you for using PDFBrief. This service was developed by
                    <br />
                    our new graduates of 2024, and it will continue to be
                    <br />
                    updated regularly. Stay tuned!
                </p>
                <LoginButton />
            </div>
        </main>
    );
}
