'use client'

import { useAppSelector } from "@/hooks";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function CalculatorPage() {
    const theme = useAppSelector((state) => state.theme.mode);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionRef = useRef<NodeJS.Timeout | null>(null);

    // Эффект для плавного перехода между темами
    useEffect(() => {
        setIsTransitioning(true);
        if (transitionRef.current) {
            clearTimeout(transitionRef.current);
        }
        transitionRef.current = setTimeout(() => {
            setIsTransitioning(false);
        }, 500); // Длительность анимации в мс

        return () => {
            if (transitionRef.current) {
                clearTimeout(transitionRef.current);
            }
        };
    }, [theme]);

    const calculators = [
        {
            title: "Martingale Calculator",
            desc: "Calculate how much money and iterations you need for guaranteed profit",
            riscLevel: "Extremely high",
            link:'/pages/calculator/martingale'
        },
        {
            title: "Sport-Bet Calculator (ROI, Flat, Statistics)",
            desc: "Analyze your sports betting strategy with ROI, flat betting and statistical calculations",
            riscLevel: "Medium (for PROs)"
            ,
            link:'/pages/calculator/sportbet'
        },
        {
            title: "Investing Calculator (Dividends)",
            desc: "Estimate investment returns based on dividend yields and growth",
            riscLevel: "Medium",
            link:'/pages/calculator/investment'
        },
        {
            title: "Budget Planner (AI utility)",
            desc: "Smart budget planning tool powered by AI to manage personal finances efficiently",
            riscLevel: "Low",
            link:'/pages/calculator/budget-planner'
        }
    ];

    // Цвета и стили в зависимости от темы
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
        <div className={`mt-23 text-center min-h-screen ${bgColor} ${textColor} transition-colors duration-500 `}>
            <div className={'max-w-5xl mx-auto'}>
            <div className={'pt-10'}>
                <h1 className={'text-xl font-medium'}>
                    List of available calculators useful for your finances
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-6 mt-6">
                {calculators.map((calculator, index) => (
                    <Link href={calculator.link} key={index}>
                    <div
                        className={`p-5 border rounded-lg shadow-sm flex flex-col h-full transition-colors duration-300 cursor-pointer ${
                            theme === 'dark'
                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-950'
                                : 'bg-white border-gray-300 hover:bg-gray-200 shadow-md hover:shadow-lg'
                        }`}
                    >
                        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {calculator.title}
                        </h3>
                        <p className={`mb-4 flex-grow ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                            {calculator.desc}
                        </p>
                        <div className="mt-auto">
                            <span
                                className={`inline-block px-3 py-1 text-sm rounded-full transition-colors duration-300 ${
                                    calculator.riscLevel === "Extremely high"
                                        ? theme === 'dark'
                                            ? 'bg-red-900 text-red-200'
                                            : 'bg-red-100 text-red-800'
                                        : calculator.riscLevel === "Medium"
                                            ? theme === 'dark'
                                                ? 'bg-yellow-900 text-yellow-200'
                                                : 'bg-yellow-100 text-yellow-600'
                                            : calculator.riscLevel === "Low"
                                                ? theme === 'dark'
                                                    ? 'bg-green-900 text-green-200'
                                                    : 'bg-green-100 text-green-800'
                                                : theme === 'dark'
                                                    ? 'bg-blue-900 text-blue-200'
                                                    : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                Risk: {calculator.riscLevel}
                            </span>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>
            </div>
        </div>
    );
}