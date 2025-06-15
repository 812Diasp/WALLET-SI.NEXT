"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import UserDropdown from "@/app/components/Navbar/UserDropdown";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { toggleTheme } from '@/app/store/themeSlice'
import { useEffect } from "react";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const theme = useAppSelector((state) => state.theme.mode);
    const dispatch = useAppDispatch();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };

    // Применяем тему к документу
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Анимация для меню
    const menuVariants = {
        hidden: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2
            }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 border-gray-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-md`}>
            {/* Контейнер с логотипом, UserDropdown и бургер-меню */}
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                {/* Логотип и UserDropdown для мобильных устройств */}
                <div className="flex items-center justify-between w-full md:hidden">
                    {/* UserDropdown слева */}
                    <UserDropdown />
                    {/* Логотип и текст справа */}
                    <Link href="/" className="flex items-center modern-gradient" onClick={closeMobileMenu}>
                        <svg
                            className="h-8"
                            width="32px"
                            height="32px"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="48" height="48" fill="white" fillOpacity="0.01" />
                            <path
                                d="M15.3399 9L6.67969 14V24V34L15.3399 39L24.0002 44L32.6605 39L41.3207 34V24V14L32.6605 9L24.0002 4L15.3399 9Z"
                                fill="#2F88FF"
                                stroke="#000000"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M24.0002 24V11M24.0002 24L34.3925 30M24.0002 24L13.6079 30"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M32.4438 15.875L35.2584 17.5V20.75M26.8146 35.375L24 37L21.1854 35.375M12.7417 20.75V17.5L15.5563 15.875"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="self-center text-2xl font-semibold whitespace-nowrap modern-gradient">
                          SI.NEXT
                        </span>
                    </Link>

                    {/* Кнопка бургер-меню */}
                    <div className="flex items-center gap-2">
                        {/*{кнопка темы на мобликах (если она есть то лого неровное)}*/}
                        {/*<button*/}
                        {/*    onClick={handleToggleTheme}*/}
                        {/*    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}*/}
                        {/*    aria-label="Toggle theme"*/}
                        {/*>*/}
                        {/*    {theme === 'dark' ? (*/}
                        {/*        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">*/}
                        {/*            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />*/}
                        {/*        </svg>*/}
                        {/*    ) : (*/}
                        {/*        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">*/}
                        {/*            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />*/}
                        {/*        </svg>*/}
                        {/*    )}*/}
                        {/*</button>*/}
                        <button
                            type="button"
                            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg focus:outline-none focus:ring-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 focus:ring-gray-600' : 'text-gray-500 hover:bg-gray-100 focus:ring-gray-200'}`}
                            onClick={toggleMobileMenu}
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className="w-5 h-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 17 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 1h15M1 7h15M1 13h15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Логотип для десктопа */}
                <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
                    <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
                        <svg
                            className="h-8"
                            width="32px"
                            height="32px"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="48" height="48" fill="white" fillOpacity="0.01" />
                            <path
                                d="M15.3399 9L6.67969 14V24V34L15.3399 39L24.0002 44L32.6605 39L41.3207 34V24V14L32.6605 9L24.0002 4L15.3399 9Z"
                                fill="#2F88FF"
                                stroke="#000000"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M24.0002 24V11M24.0002 24L34.3925 30M24.0002 24L13.6079 30"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M32.4438 15.875L35.2584 17.5V20.75M26.8146 35.375L24 37L21.1854 35.375M12.7417 20.75V17.5L15.5563 15.875"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="self-center text-2xl font-semibold whitespace-nowrap modern-gradient">
                            SI.NEXT
                        </span>
                    </Link>
                </div>

                {/* UserDropdown и кнопка темы для десктопа */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={handleToggleTheme}
                        className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                    <UserDropdown />
                </div>
            </div>

            {/* Центрированный список для десктопа */}
            <div className={`hidden md:block ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="container mx-auto px-4">
                    <ul className="flex justify-center space-x-8">
                        <li>
                            <Link
                                href="/"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                aria-current="page"
                                onClick={closeMobileMenu}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pages/about"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                onClick={closeMobileMenu}
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pages/wallet"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                onClick={closeMobileMenu}
                            >
                                Wallet
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pages/invest"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                onClick={closeMobileMenu}
                            >
                                Investments
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pages/aiassist"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                onClick={closeMobileMenu}
                            >
                                AI Assistant
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/pages/login"
                                className={`block py-2 px-3 rounded-sm md:hover:bg-transparent md:p-0 ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'} mb-3 text-base`}
                                onClick={closeMobileMenu}
                            >
                                Sign up / Login
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Мобильное меню (fixed поверх контента) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                        className={`md:hidden fixed inset-0 z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} backdrop-blur-md bg-opacity-95 flex flex-col`}
                    >
                        <div className={`p-4 flex justify-between items-center border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Menu</span>
                            <button
                                onClick={toggleMobileMenu}
                                className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                                &times;
                            </button>
                        </div>
                        <ul className="flex-1 flex flex-col font-medium p-4 mt-2 space-y-4">
                            <li>
                                <Link
                                    href="/"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pages/about"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pages/wallet"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    Wallet
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pages/invest"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    Investments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pages/aiassist"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    AI Assistant
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pages/login"
                                    className={`block py-2 px-3 rounded-sm ${theme === 'dark' ? 'text-white hover:text-blue-500' : 'text-gray-900 hover:text-blue-700'}`}
                                    onClick={closeMobileMenu}
                                >
                                    Login
                                </Link>
                            </li>
                            <li className="mt-8">
                                <button
                                    onClick={handleToggleTheme}
                                    className={`flex items-center gap-2 p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                            </svg>
                                            <span>Switch to Light Mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                            </svg>
                                            <span>Switch to Dark Mode</span>
                                        </>
                                    )}
                                </button>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}