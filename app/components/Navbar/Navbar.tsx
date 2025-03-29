"use client";
import { useState } from "react";
import Link from "next/link";
import UserDropdown from "@/app/components/Navbar/UserDropdown";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Состояние для бургер-меню

    // Функция для переключения меню
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Функция для закрытия меню
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="border-gray-200 text-white bg-gray-900">
            {/* Контейнер с логотипом, UserDropdown и бургер-меню */}
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                {/* Логотип и UserDropdown для мобильных устройств */}
                <div className="flex items-center justify-between w-full md:hidden">
                    {/* UserDropdown слева */}
                    <UserDropdown />
                    {/* Логотип и текст справа */}
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
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              SI.NEXT
            </span>
                    </Link>
                    {/* Кнопка бургер-меню */}
                    <button
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        onClick={toggleMobileMenu} // Переключаем меню
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
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              SI.NEXT
            </span>
                    </Link>
                </div>
                {/* UserDropdown для десктопа */}
                <div className="hidden md:block">
                    <UserDropdown />
                </div>
            </div>
            {/* Центрированный список для десктопа */}
            <div className="hidden md:block bg-gray-900">
                <div className="container mx-auto px-4">
                    <ul className="flex justify-center space-x-8">
                        <li>
                            <Link
                                href="/"
                                className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 dark:text-white dark:hover:text-blue-500"
                                aria-current="page"
                                onClick={closeMobileMenu} // Закрываем меню
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 dark:text-white dark:hover:text-blue-500"
                                onClick={closeMobileMenu} // Закрываем меню
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/wallet"
                                className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 dark:text-white dark:hover:text-blue-500"
                                onClick={closeMobileMenu} // Закрываем меню
                            >
                                Wallet
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/invest"
                                className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 dark:text-white dark:hover:text-blue-500"
                                onClick={closeMobileMenu} // Закрываем меню
                            >
                                Investments
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/login"
                                className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 dark:text-white dark:hover:text-blue-500"
                                onClick={closeMobileMenu} // Закрываем меню
                            >
                                Sign up / Login
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            {/* Мобильное меню */}
            <div
                className={`${isMobileMenuOpen ? "block" : "hidden"} w-full md:hidden`} // Управляем видимостью
                id="navbar-user"
            >
                <ul className="flex flex-col font-medium p-4 mt-4 border border-gray-100 rounded-lg bg-blue-900 dark:bg-blue-900 dark:border-gray-700">
                    <li>
                        <Link
                            href="/"
                            className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 dark:hover:text-blue-500"
                            onClick={closeMobileMenu} // Закрываем меню
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/about"
                            className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 dark:hover:text-blue-500"
                            onClick={closeMobileMenu} // Закрываем меню
                        >
                            About
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/wallet"
                            className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 dark:hover:text-blue-500"
                            onClick={closeMobileMenu} // Закрываем меню
                        >
                            Wallet
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/invest"
                            className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 dark:hover:text-blue-500"
                            onClick={closeMobileMenu} // Закрываем меню
                        >
                            Investments
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/login"
                            className="block py-2 px-3 text-white rounded-sm hover:bg-blue-700 dark:hover:text-blue-500"
                            onClick={closeMobileMenu} // Закрываем меню
                        >
                            Login
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}