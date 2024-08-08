"use client";
import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="text-xl font-bold">MyLogo</div>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-gray-700 text-white px-3 py-1 rounded-l-md focus:outline-none"
                        />
                        <button className="bg-blue-500 px-3 py-1 rounded-r-md hover:bg-blue-600">
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        <a
                            href="#"
                            className="hover:text-gray-300"
                            role="menuitem"
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="hover:text-gray-300"
                            role="menuitem"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="hover:text-gray-300"
                            role="menuitem"
                        >
                            Services
                        </a>
                        <a
                            href="#"
                            className="hover:text-gray-300"
                            role="menuitem"
                        >
                            Contact
                        </a>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="mt-4 md:hidden">
                        <a
                            href="#"
                            className="block py-2 hover:text-gray-300"
                            role="menuitem"
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="block py-2 hover:text-gray-300"
                            role="menuitem"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="block py-2 hover:text-gray-300"
                            role="menuitem"
                        >
                            Services
                        </a>
                        <a
                            href="#"
                            className="block py-2 hover:text-gray-300"
                            role="menuitem"
                        >
                            Contact
                        </a>
                        <div className="mt-4 flex items-center">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-700 text-white px-3 py-1 rounded-l-md focus:outline-none flex-grow"
                            />
                            <button className="bg-blue-500 px-3 py-1 rounded-r-md hover:bg-blue-600">
                                <Search size={20} />
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
