'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmEmailPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const router = useRouter();

    useEffect(() => {
        const confirmEmail = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userId');

            if (!userId) {
                setError("Не указан ID пользователя");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5095/api/auth/confirm-email?userId=${userId}`);

                if (!res.ok) {
                    throw new Error("Ошибка при подтверждении email");
                }

                setSuccess(true);
            } catch (err: any) {
                setError(err.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        };

        confirmEmail();
    }, []);

    // Отсчёт и редирект после успеха
    useEffect(() => {
        if (success) {
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        router.push('/login');
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [success, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <p>Подтверждение email...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
                {error ? (
                    <>
                        <h1 className="text-xl font-bold text-red-500 mb-4">Ошибка</h1>
                        <p>{error}</p>
                    </>
                ) : success ? (
                    <>
                        <h1 className="text-xl font-bold text-green-500 mb-4">Email подтвержден!</h1>
                        <p>Ваш email успешно подтвержден.</p>
                        <p className="mt-4 text-gray-500">Переход на страницу входа через {countdown}...</p>
                    </>
                ) : (
                    <p>Что-то пошло не так</p>
                )}
            </div>
        </div>
    );
}
