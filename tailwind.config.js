/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Используем class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            translate: {
                '101': '101%',
            },
            keyframes: {
                marquee: {
                    'from': { transform: 'translateX(0%)' },
                    'to': { transform: 'translateX(-50%)' },
                },
                glow: {
                    '0%, 100%': {
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                    },
                    '50%': {
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.7)',
                    },
                },
            },
            animation: {
                marquee: 'marquee 15s linear infinite',
                glow: 'glow 1.2s ease-in-out infinite',
            },
        },
    },
    plugins: [
        // ваши плагины
    ],
};
