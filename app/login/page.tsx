'use client';
import { useState } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLogin && password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        console.log({ email, password, rememberMe });
    };

    const toggleForm = () => {
        setIsLogin((prev) => !prev);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <>
            <Head>
                <title>{isLogin ? 'Sign in SI.WALLET' : 'Sign up in SI.WALLET'}</title>
            </Head>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                {/* Форма */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md mx-auto space-y-4 rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 sm:w-96"
                >
                    {/* Заголовок */}
                    <h1 className="text-2xl font-bold text-center mb-6">
                        {isLogin ? 'Sign in SI.WALLET' : 'Sign up SI.WALLET'}
                    </h1>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Введите вашу электронную почту
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 16"
                                >
                                    <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                                    <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@flowbite.com"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Введите ваш пароль
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <svg fill="#99a1af" height="16px" width="16px" version="1.1" id="Layer_1"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 512.006 512.006"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier"> <g> <g> <path
                                        d="M362.673,0C280.192,0,213.34,66.853,213.34,149.333c0,33.545,11.059,64.505,29.729,89.434l-98.147,98.147 c0,0,0,0-0.001,0.001s0,0-0.001,0.001l-63.999,63.999c0,0,0,0-0.001,0.001s0,0-0.001,0.001L6.248,475.588 c-8.331,8.331-8.331,21.839,0,30.17s21.839,8.331,30.17,0l59.588-59.588l59.582,59.582c8.331,8.331,21.839,8.331,30.17,0 c8.331-8.331,8.331-21.839,0-30.17L126.176,416l33.83-33.83l38.248,38.248c8.331,8.331,21.839,8.331,30.17,0 c8.331-8.331,8.331-21.839,0-30.17L190.176,352l83.062-83.063c24.929,18.67,55.889,29.729,89.434,29.729 c82.481,0,149.333-66.853,149.333-149.333S445.154,0,362.673,0z M362.673,256c-29.38,0-55.982-11.876-75.272-31.088 c-0.051-0.052-0.094-0.109-0.146-0.161s-0.109-0.095-0.161-0.146c-19.212-19.29-31.088-45.892-31.088-75.272 c0-58.917,47.75-106.667,106.667-106.667c58.917,0,106.667,47.75,106.667,106.667C469.34,208.25,421.59,256,362.673,256z"></path> </g> </g> </g></svg>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите ваш пароль"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 end-0 flex items-center pe-3 cursor-pointer text-gray-500 dark:text-gray-400"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 1a9 9 0 0 0-9 9v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10a9 9 0 0 0-9-9Zm0 11a2 2 0 0 1-2-2V6a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2Z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3l8 5 8-5M3 11l8-5 8 5"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field (only for registration) */}
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Подтвердите пароль
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg fill="#99a1af" height="16px" width="16px" version="1.1" id="Layer_1"
                                         xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 512.006 512.006"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier"> <g> <g> <path
                                            d="M362.673,0C280.192,0,213.34,66.853,213.34,149.333c0,33.545,11.059,64.505,29.729,89.434l-98.147,98.147 c0,0,0,0-0.001,0.001s0,0-0.001,0.001l-63.999,63.999c0,0,0,0-0.001,0.001s0,0-0.001,0.001L6.248,475.588 c-8.331,8.331-8.331,21.839,0,30.17s21.839,8.331,30.17,0l59.588-59.588l59.582,59.582c8.331,8.331,21.839,8.331,30.17,0 c8.331-8.331,8.331-21.839,0-30.17L126.176,416l33.83-33.83l38.248,38.248c8.331,8.331,21.839,8.331,30.17,0 c8.331-8.331,8.331-21.839,0-30.17L190.176,352l83.062-83.063c24.929,18.67,55.889,29.729,89.434,29.729 c82.481,0,149.333-66.853,149.333-149.333S445.154,0,362.673,0z M362.673,256c-29.38,0-55.982-11.876-75.272-31.088 c-0.051-0.052-0.094-0.109-0.146-0.161s-0.109-0.095-0.161-0.146c-19.212-19.29-31.088-45.892-31.088-75.272 c0-58.917,47.75-106.667,106.667-106.667c58.917,0,106.667,47.75,106.667,106.667C469.34,208.25,421.59,256,362.673,256z"></path> </g> </g> </g></svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Подтвердите пароль"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Remember Me Checkbox */}
                    {isLogin && (
                        <div className="flex items-center mt-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                            <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Запомнить меня
                            </label>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-4 px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
                    >
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>

                    {/* Registration Link */}
                    <p className="mt-2 text-center text-gray-500">
                        {isLogin ? 'У вас нет аккаунта?' : 'У вас уже есть аккаунт?'}{' '}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="text-blue-500 hover:underline"
                        >
                            {isLogin ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </p>

                    {/* OAuth Buttons */}
                    <div className="mt-4 space-y-2">
                        {/* Google Button */}
                        <button
                            onClick={() => signIn('google')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2 text-white bg-red-800 hover:bg-red-700 rounded-lg"
                        >
                            <Image
                                src="/icons/google-logo.svg"
                                alt="Google Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6"
                            />
                            <span>With Google</span>
                        </button>
                        {/* GitHub Button */}
                        <button
                            onClick={() => signIn('github')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                            <Image
                                src="/icons/github-logo.svg"
                                alt="GitHub Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6"
                            />
                            <span>With GitHub</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}