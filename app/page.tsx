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
import SpotlightCard from "@/app/components/SpotlightCard/SpotlightCard";
import FlowingMenu from "@/app/components/Menu/FlowMenu";
import DecryptedText from "@/app/components/CryptoText/DecryptedText";

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
    const demoItems = [
        { link: '/pages/wallet', text: 'Wallet 👛', image: 'https://picsum.photos/600/400?random=1' },
        { link: '/pages/portfolio', text: 'Your portfolio 💼', image: 'https://picsum.photos/600/400?random=2' },
        { link: '/pages/calc', text: 'Calculators 🖩', image: 'https://picsum.photos/600/400?random=3' },
        { link: '/pages/aiassist', text: 'AI ASSISTANT 🤖 (NEW!)', image: 'https://picsum.photos/600/400?random=4' }
    ];
    // Цвета для темной и светлой темы
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const cardBgColor = theme === 'dark' ? 'bg-gray-900/[.03]' : 'bg-white/[.03]';
    const cardHoverColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
    const sectionBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    const gridColor = theme === 'dark' ? '#4B5563' : '#E5E7EB';

    // @ts-ignore
    return (
        <div className={`min-h-screen ${bgColor} ${textColor} relative overflow-hidden transition-colors duration-500 opacity-100 mt-12 md:mt-25`}>
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
                                description: "Easily monitor your daily expenses and categorize them.",
                                color_light:'rgba(0, 43, 255, 0.4)',
                                color_dark:'rgba(0, 255, 158, 0.4)'
                            },
                            {
                                title: "Investment Insights",
                                description: "Get detailed insights into your investments and portfolio growth.",
                                color_light:'rgba(0, 170, 153, 0.4)',
                                color_dark:'rgba(138, 0, 175, 0.4)'
                            },
                            {
                                title: "Secure & Reliable",
                                description: "Your data is safe with us. We use industry-standard encryption.",
                                color_light:'rgba(211, 0, 182, 0.4)',
                                color_dark:'rgba(66, 239, 0, 0.4)'
                            }
                        ].map((feature, index) => (
                                //spotlightColor можно забить на ошибку тут все коррект
                                <SpotlightCard
                                    key={index}
                                    className="custom-spotlight-card cursor-pointer mb-12"
                                    spotlightColor={theme === 'dark' ? `${feature.color_dark}` : `${feature.color_light}`}
                                    bgColor={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-200'}
                                >
                                    <h3 className="text-xl font-semibold mb-2 border-b-black">
                                        <DecryptedText

                                            text={feature.title}

                                            speed={120}

                                            maxIterations={20}

                                            useOriginalCharsOnly={true}
                                            sequential={true}
                                            className=""
                                            animateOn={'view'}
                                            parentClassName="all-letters"

                                            encryptedClassName="encrypted"
                                        />
                                    </h3>
                                    <p className={secondaryTextColor}>
                                        {feature.description}
                                    </p>
                                </SpotlightCard>


                        ))}

                    </div>

                    <SpotlightCard
                        className="custom-spotlight-card cursor-pointer"
                        spotlightColor={theme === 'dark' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 100, 255, 0.3)'}
                        bgColor={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-200'}
                    >
                        <div className="css-efn5la">
                            <svg
                                stroke="currentColor"
                                fill={theme === 'dark' ? 'white' : 'black'} // Цвет зависит от темы
                                strokeWidth="0"
                                viewBox="0 0 16 16"
                                focusable="false"
                                className="chakra-icon css-1rokc8z"
                                height="1em"
                                width="1em"
                            >
                                <path
                                    d="M 5.398 10.807 C 5.574 10.931 5.785 10.998 6 10.997 C 6.216 10.998 6.427 10.93 6.602 10.804 C 6.78 10.674 6.915 10.494 6.989 10.286 L 7.436 8.913 C 7.551 8.569 7.744 8.256 8 7.999 C 8.257 7.743 8.569 7.549 8.913 7.434 L 10.304 6.983 C 10.456 6.929 10.594 6.84 10.706 6.724 C 10.817 6.608 10.901 6.467 10.949 6.313 C 10.998 6.159 11.01 5.996 10.985 5.837 C 10.96 5.677 10.898 5.526 10.804 5.394 C 10.67 5.208 10.479 5.071 10.26 5.003 L 8.885 4.556 C 8.541 4.442 8.228 4.249 7.971 3.993 C 7.714 3.736 7.52 3.424 7.405 3.079 L 6.953 1.691 C 6.881 1.489 6.748 1.314 6.571 1.191 C 6.439 1.098 6.286 1.036 6.125 1.012 C 5.965 0.987 5.801 1.001 5.646 1.051 C 5.492 1.101 5.351 1.187 5.236 1.301 C 5.12 1.415 5.033 1.555 4.98 1.708 L 4.523 3.108 C 4.409 3.443 4.22 3.748 3.97 3.999 C 3.721 4.25 3.418 4.441 3.083 4.557 L 1.692 5.005 C 1.541 5.06 1.404 5.149 1.292 5.265 C 1.18 5.381 1.097 5.521 1.048 5.675 C 1 5.829 0.988 5.992 1.013 6.151 C 1.038 6.31 1.099 6.462 1.192 6.593 C 1.32 6.773 1.501 6.908 1.709 6.979 L 3.083 7.424 C 3.524 7.571 3.91 7.845 4.193 8.212 C 4.356 8.423 4.481 8.66 4.564 8.912 L 5.016 10.303 C 5.088 10.507 5.222 10.683 5.398 10.807 Z M 11.535 14.849 C 11.671 14.946 11.834 14.997 12 14.997 C 12.165 14.997 12.326 14.946 12.461 14.851 C 12.601 14.753 12.706 14.613 12.761 14.451 L 13.009 13.689 C 13.063 13.531 13.152 13.387 13.269 13.268 C 13.387 13.15 13.531 13.061 13.689 13.009 L 14.461 12.757 C 14.619 12.703 14.756 12.6 14.852 12.464 C 14.926 12.361 14.974 12.242 14.992 12.117 C 15.011 11.992 14.999 11.865 14.959 11.745 C 14.918 11.625 14.85 11.516 14.76 11.428 C 14.669 11.34 14.559 11.274 14.438 11.236 L 13.674 10.987 C 13.516 10.935 13.372 10.846 13.254 10.729 C 13.136 10.611 13.047 10.467 12.994 10.309 L 12.742 9.536 C 12.689 9.379 12.586 9.242 12.449 9.146 C 12.347 9.073 12.23 9.025 12.106 9.006 C 11.982 8.987 11.855 8.998 11.736 9.037 C 11.616 9.076 11.508 9.142 11.419 9.231 C 11.33 9.319 11.264 9.427 11.224 9.546 L 10.977 10.308 C 10.925 10.466 10.838 10.61 10.721 10.728 C 10.607 10.845 10.467 10.934 10.312 10.987 L 9.539 11.239 C 9.38 11.293 9.242 11.396 9.145 11.533 C 9.047 11.669 8.995 11.833 8.996 12.001 C 8.997 12.169 9.051 12.333 9.15 12.468 C 9.249 12.604 9.388 12.705 9.547 12.757 L 10.31 13.004 C 10.469 13.058 10.614 13.147 10.732 13.265 C 10.851 13.384 10.939 13.528 10.99 13.687 L 11.243 14.461 C 11.298 14.618 11.4 14.753 11.535 14.849 Z"></path>

                            </svg>
                            <p className="chakra-text css-v5mywq"
                               style={{color: theme === 'dark' ? 'white' : '#111827'}}>
                                Boost Your Experience
                            </p>
                            <p
                                className="chakra-text css-1kyqync"
                                style={{color: theme === 'dark' ? '#A9A9A9' : '#4B5563'}}
                            >
                                Get exclusive benefits, features & 24/7 support as a permanent club member.
                            </p>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-6">
                                Join now
                            </button>
                        </div>
                    </SpotlightCard>
                </div>
            </section>


            <section className={`justify-center flex ${theme === 'dark' ? 'bg-black-111' : 'bg-gray-100'} p-8 rounded-xl transition-colors duration-300`}>
                <div style={{ height: '600px', position: 'relative', width: '70%' }}>
                    <FlowingMenu items={demoItems} theme={theme} />
                </div>
            </section>

        </div>
    );
}