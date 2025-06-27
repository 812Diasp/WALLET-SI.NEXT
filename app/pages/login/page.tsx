'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/store';

import { setToken, setUser, setWalletId, setUserId } from '@/app/store/userSlice';
import { toggleTheme } from '@/app/store/themeSlice';
import {getToken} from "next-auth/jwt";

// Утилитный класс для инпутов с плавным переходом тем
const inputClass = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
  transition-colors duration-500`;

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const theme = useSelector((state: RootState) => state.theme.mode);

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsTransitioning(true);

        if (transitionRef.current) {
            clearTimeout(transitionRef.current);
        }

        transitionRef.current = setTimeout(() => setIsTransitioning(false), 500);

        return () => {
            if (transitionRef.current) {
                clearTimeout(transitionRef.current);
            }
        };
    }, [theme]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация паролей при регистрации
        if (!isLogin && password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Отправка запроса на авторизацию/регистрацию
            const res = await fetch(`http://localhost:5095/api/auth/${isLogin ? 'login' : 'register'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isLogin
                    ? { usernameOrEmail: username || email, password }
                    : { username, email, password, confirmPassword }),
            });

            // Проверка ответа сервера
            const isJson = res.headers.get('content-type')?.includes('application/json');
            if (!res.ok) {
                let message = 'Ошибка авторизации';
                if (isJson) {
                    const data = await res.json();
                    message = data.message || message;
                } else {
                    const text = await res.text();
                    message = text || message;
                }
                setError(message);
                return;
            }

            const data = await res.json();
            console.log('Auth response:', data); // Логируем ответ для отладки

            // Проверяем наличие обязательных полей
            if (!data.token || !data.userId) {
                throw new Error('Неполные данные в ответе сервера');
            }

            // Сохраняем основные данные
            dispatch(setToken(data.token));
            dispatch(setUserId(data.userId));

            // Пытаемся получить walletId из разных источников
            let walletId = data.walletId || data.Wallet?.Id || null;

            // Если walletId нет в основном ответе, делаем отдельный запрос
            if (!walletId) {
                console.log('WalletId not found in auth response, making additional request...');
                const walletRes = await fetch(`http://localhost:5095/api/wallet/${data.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });

                if (walletRes.ok) {
                    const walletData = await walletRes.json();
                    console.log('Wallet response:', walletData);
                    walletId = walletData.id || walletData.Id || walletData.walletId;
                }
            }

            // Если walletId найден, сохраняем его
            if (walletId) {
                dispatch(setWalletId(walletId));
                localStorage.setItem('walletId', walletId);
                console.log('WalletId saved:', walletId);
            } else {
                console.warn('WalletId not found after all attempts');
            }

            // Сохраняем email, если он есть
            if (data.email) {
                dispatch(setUser({ email: data.email }));
            }

            // Сохраняем остальные данные в localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);

            // Перенаправляем пользователя
            router.push('/pages/wallet');

        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err?.message || 'Произошла непредвиденная ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-screen
        ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}
        transition-colors duration-500`}
        >
            {/* Кнопка переключения темы */}
            <button
                onClick={() => dispatch(toggleTheme())}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-500"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-md mx-auto space-y-4 rounded-lg shadow-md p-6
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          transition-colors duration-500`}
            >
                <h1 className="text-2xl font-bold text-center mb-6">
                    {isLogin ? 'Вход в SI.WALLET' : 'Регистрация в SI.WALLET'}
                </h1>

                {!isLogin && (
                    <div>
                        <label htmlFor="username" className="block mb-2 text-sm font-medium">
                            Логин
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введите логин"
                            className={inputClass}
                            required
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">
                        Электронная почта
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        className={inputClass}
                        required
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                            Повторите пароль
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Подтвердите пароль"
                            className={inputClass}
                            required
                        />
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-300 transition-colors duration-500"
                >
                    {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <p className="mt-2 text-center text-sm">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-500 hover:underline"
                    >
                        {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
                    </button>
                </p>
            </form>
        </div>
    );
}
