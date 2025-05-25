"use client";
import { useState, useEffect, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "@/hooks";

// Определяем интерфейс для данных графика
interface ChartData {
    day: string;
    expenses: number; // Расходы
    income: number; // Доходы
}

export default function Home() {
    const [data, setData] = useState<ChartData[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

    // Генерация данных для графика
    useEffect(() => {
        const generateData = (): ChartData[] => {
            const newData: ChartData[] = [];
            // Базовые значения (средние показатели)
            let prevExpenses = 85;
            let prevIncome = 120;

            for (let i = 0; i < 10; i++) {
                const expenses = Math.max(
                    60,
                    prevExpenses + (Math.random() * 30 - 10)
                );
                const income = Math.max(
                    100,
                    prevIncome + (Math.random() * 40 - 10)
                );

                newData.push({
                    day: `Day ${i + 1}`,
                    expenses: Math.round(expenses),
                    income: Math.round(income),
                });

                prevExpenses = expenses;
                prevIncome = income;
            }
            return newData;
        };

        setData(generateData());
    }, []);

    // Анимация фона с учетом темы
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const lines: number[][] = [];
        const lineCount = 2;
        const pointsPerLine = width < 768 ? 15 : 40;

        // Инициализация данных для линий
        for (let i = 0; i < lineCount; i++) {
            const line: number[] = [];
            for (let j = 0; j < pointsPerLine; j++) {
                line.push(Math.random() * height);
            }
            lines.push(line);
        }

        let frame = 0;

        const animate = () => {
            // Прозрачность зависит от состояния перехода
            const opacity = isTransitioning ? 0.1 : 0.3;

            ctx.clearRect(0, 0, width, height);

            // Рисуем каждую линию с учетом темы
            lines.forEach((line, lineIndex) => {
                ctx.beginPath();

                // Цвета линий в зависимости от темы
                const hue = theme === 'dark'
                    ? (lineIndex === 0 ? 200 : 340)
                    : (lineIndex === 0 ? 210 : 350);

                ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${opacity})`;
                ctx.lineWidth = width < 768 ? 0.5 : 1;

                for (let i = 0; i < pointsPerLine; i++) {
                    const x = (i / pointsPerLine) * width;
                    const y = line[i];

                    line[i] += Math.sin((frame + i * 10) / 100) * 0.5;
                    line[i] = Math.max(0, Math.min(height, line[i]));

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.stroke();
            });

            frame++;
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            lines.forEach((line) => {
                for (let i = 0; i < pointsPerLine; i++) {
                    line[i] = Math.random() * height;
                }
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(frame);
        };
    }, [theme, isTransitioning]);

    // Цвета для темной и светлой темы
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const cardHoverColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
    const sectionBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    const gridColor = theme === 'dark' ? '#4B5563' : '#E5E7EB';

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} relative overflow-hidden transition-colors duration-500 opacity-100`}>
            {/* Canvas для фоновой анимации */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ pointerEvents: "none" }}
            ></canvas>

            {/* Header Section */}
            <header className={`relative z-10 py-8 px-4 text-center transition-opacity duration-500 opacity-100`}>
                <h1 className="text-4xl font-bold mb-4">Welcome to SI.NEXT</h1>
                <p className={`text-lg ${secondaryTextColor}`}>
                    Your personal finance and investment tracker.
                </p>

                {/* График из Recharts */}
                <div className="mt-8 max-w-md mx-auto">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis
                                dataKey="day"
                                stroke={theme === 'dark' ? '#8884d8' : '#4B5563'}
                                angle={-45}
                                dx={-10}
                                dy={10}
                            />
                            <YAxis stroke={theme === 'dark' ? '#8884d8' : '#4B5563'} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                    borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                                    borderRadius: '0.5rem',
                                    color: theme === 'dark' ? '#FFFFFF' : '#111827'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke="#f87171"
                                strokeWidth={2}
                                dot={{ fill: "#f87171", r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#34d399"
                                strokeWidth={2}
                                dot={{ fill: "#34d399", r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </header>

            {/* Hero Section */}
            <section className={`relative z-10 py-12 px-4 transition-opacity duration-500 opacity-100`}>
                <div className={`max-w-4xl mx-auto ${cardBgColor} rounded-lg shadow-lg p-6 transition-colors duration-500`}>
                    <h2 className="text-2xl font-semibold mb-4">Your Financial Overview</h2>
                    <p className={secondaryTextColor}>
                        Monitor your expenses and investments in real-time.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className={`relative z-10 py-12 px-4 ${sectionBgColor} transition-colors duration-500`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Why Choose SI.NEXT?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Track Expenses",
                                description: "Easily monitor your daily expenses and categorize them."
                            },
                            {
                                title: "Investment Insights",
                                description: "Get detailed insights into your investments and portfolio growth."
                            },
                            {
                                title: "Secure & Reliable",
                                description: "Your data is safe with us. We use industry-standard encryption."
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`${cardBgColor} rounded-lg p-6 ${cardHoverColor} transition-all duration-300`}
                            >
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className={secondaryTextColor}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}