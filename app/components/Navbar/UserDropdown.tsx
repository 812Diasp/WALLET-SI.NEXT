"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MouseEvent } from "react";

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null); // Явно указываем тип ref

    // Закрыть dropdown при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside as never); // Приведение типа для обхода ошибки TypeScript
        return () => {
            document.removeEventListener("mousedown", handleClickOutside as never); // Приведение типа для обхода ошибки TypeScript
        };
    }, []);

    return (
        <div className="relative flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse" ref={dropdownRef}>
            {/* Кнопка для открытия dropdown */}
            <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <Image
                    width={32}
                    height={32}
                    quality={60}
                    className="w-8 h-8 rounded-full"
                    src="/avatars/default_avatar_bacteria.svg"
                    alt="user photo"
                />
            </button>

            {/* Dropdown меню */}
            {isOpen && (
                <div
                    className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsOpen(false)} // Закрыть при клике вне меню
                >
                    <div
                        className="relative w-full max-w-sm p-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600"
                        onClick={(e) => e.stopPropagation()} // Предотвратить закрытие при клике внутри меню
                    >
                        <div className="px-4 py-3">
                            <span className="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
                            <span className="block text-sm text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
                        </div>
                        <ul className="py-2" aria-labelledby="user-menu-button">
                            <li>
                                <Link
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    onClick={() => setIsOpen(false)} // Закрыть меню после выбора
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    onClick={() => setIsOpen(false)} // Закрыть меню после выбора
                                >
                                    Settings
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    onClick={() => setIsOpen(false)} // Закрыть меню после выбора
                                >
                                    Earnings
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    onClick={() => setIsOpen(false)} // Закрыть меню после выбора
                                >
                                    Sign out
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;