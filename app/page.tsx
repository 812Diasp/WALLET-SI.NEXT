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

// Определяем интерфейс для данных графика
interface ChartData {
    day: string;
    expenses: number; // Расходы
    income: number; // Доходы
}

export default function Home() {
    const [data, setData] = useState<ChartData[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Генерация данных для графика
    useEffect(() => {
        const generateData = (): ChartData[] => {
            const newData: ChartData[] = [];
            // Базовые значения (средние показатели)
            let prevExpenses = 85; // Средние ежедневные расходы ($2,500 / 30 дней)
            let prevIncome = 120;  // Средние ежедневные доходы ($3,500 / 30 дней)

            for (let i = 0; i < 10; i++) {
                // Добавляем небольшие колебания к базовым значениям
                const expenses = Math.max(
                    60, // Минимальные расходы
                    prevExpenses + (Math.random() * 30 - 10) // Колебания ± $10
                );
                const income = Math.max(
                    100, // Минимальные доходы
                    prevIncome + (Math.random() * 40 - 10) // Колебания ± $15
                );

                newData.push({
                    day: `Day ${i + 1}`,
                    expenses: Math.round(expenses),
                    income: Math.round(income),
                });

                // Обновляем предыдущие значения для следующей итерации
                prevExpenses = expenses;
                prevIncome = income;
            }
            return newData;
        };

        setData(generateData());
    }, []);

    // Анимация фона
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
        const lineCount = 2; // Количество линий
        const pointsPerLine = width < 768 ? 15 : 40; // Меньше точек на мобильных устройствах

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
            ctx.clearRect(0, 0, width, height);

            // Рисуем каждую линию
            lines.forEach((line, lineIndex) => {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${lineIndex === 0 ? 200 : 340}, 60%, 60%, 0.3)`; // Более тусклые цвета
                ctx.lineWidth = width < 768 ? 0.5 : 1; // Тоньше линии на мобильных устройствах

                for (let i = 0; i < pointsPerLine; i++) {
                    const x = (i / pointsPerLine) * width;
                    const y = line[i];

                    // Обновляем позицию точки (меньшая амплитуда)
                    line[i] += Math.sin((frame + i * 10) / 100) * 0.5;

                    // Ограничиваем значение y границами экрана
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

        // Обработчик изменения размеров окна
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Пересчитываем координаты линий
            lines.forEach((line) => {
                for (let i = 0; i < pointsPerLine; i++) {
                    line[i] = Math.random() * height;
                }
            });
        };

        window.addEventListener("resize", handleResize);

        // Очистка при размонтировании компонента
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Canvas для фоновой анимации */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ pointerEvents: "none" }}
            ></canvas>

            {/* Header Section */}
            <header className="relative z-10 py-8 px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to SI.NEXT</h1>
                <p className="text-lg text-gray-400">
                    Your personal finance and investment tracker.
                </p>

                {/* График из Recharts */}
                <div className="mt-8 max-w-md mx-auto">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" stroke="#8884d8" angle={-45} dx={-10} dy={10} />
                            <YAxis stroke="#8884d8" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke="#f87171" // Красная линия для расходов
                                strokeWidth={2}
                                dot={{ fill: "#f87171", r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#34d399" // Зеленая линия для доходов
                                strokeWidth={2}
                                dot={{ fill: "#34d399", r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 py-12 px-4">
                <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Your Financial Overview</h2>
                    <p className="text-gray-400">
                        Monitor your expenses and investments in real-time.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-12 px-4 bg-gray-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Why Choose SI.NEXT?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition duration-300">
                            <h3 className="text-xl font-semibold mb-2">Track Expenses</h3>
                            <p className="text-gray-400">
                                Easily monitor your daily expenses and categorize them.
                            </p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition duration-300">
                            <h3 className="text-xl font-semibold mb-2">Investment Insights</h3>
                            <p className="text-gray-400">
                                Get detailed insights into your investments and portfolio growth.
                            </p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition duration-300">
                            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                            <p className="text-gray-400">
                                Your data is safe with us. We use industry-standard encryption.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative z-10 py-8 px-4 bg-gray-900 text-center text-gray-400">
                <p>&copy; 2025 SI.NEXT All rights reserved.</p>
            </footer>
        </div>
    );
}