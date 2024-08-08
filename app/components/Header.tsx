"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/app/AuthProvider";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from 'next/navigation';
import { DeleteAllFilesButton } from '@/app/components/DeleteAllFileButton';
import { AnimatePresence, motion } from 'framer-motion';

const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-3 text-gray-700">Signing out...</p>
        </div>
    </div>
);

const LogoutAnimation = ({ onComplete }: { onComplete: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={onComplete}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white text-4xl"
        >
            Goodbye!
        </motion.div>
    </motion.div>
);

export interface HeaderProps {
    setSettingOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSettingOpen }) => {
    const { user, signOutUser } = useAuthContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOutUser();
            setShowLogoutAnimation(true);
        } catch (error) {
            console.error('Logout failed:', error);
            alert('ログアウトに失敗しました。もう一度お試しください。');
            setIsLoading(false);
        }
    };

    const handleAnimationComplete = () => {
        router.push('/');
    };

    useEffect(() => {
        if (!user && !isLoading && !showLogoutAnimation) {
            router.push('/');
        }
    }, [user, isLoading, showLogoutAnimation, router]);

    const handleSetting = () => {
        setSettingOpen(true);
        setIsMenuOpen(false);
    };

    if (!user && !showLogoutAnimation) {
        return <LoadingOverlay />;
    }
    return (
        <>
            <header className="flex justify-between items-center p-4 bg-white">
                <div></div>
                <motion.div className="relative">
                    <motion.button
                        className="flex items-center"
                        onClick={toggleMenu}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Image
                            src={user?.photoURL || '/default-avatar.png'}
                            width={40}
                            height={40}
                            alt={user?.displayName || 'User'}
                            className="w-10 h-10 rounded-full mr-2"
                        />
                        <motion.div
                            initial={false}
                            animate={{ rotate: isMenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown className="w-8 h-8" />
                        </motion.div>
                    </motion.button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 overflow-hidden"
                            >
                                <div className="py-2">
                                    <motion.button
                                        onClick={handleSetting}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                        Account Settings
                                    </motion.button>
                                    {user && <DeleteAllFilesButton userId={user.uid} />}
                                    <motion.button
                                        onClick={handleSignOut}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-3 text-red-500" />
                                        Logout
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </header>
            <AnimatePresence>
                {showLogoutAnimation && <LogoutAnimation onComplete={handleAnimationComplete} />}
            </AnimatePresence>
            {isLoading && <LoadingOverlay />}
        </>
    );
};

export default Header;
