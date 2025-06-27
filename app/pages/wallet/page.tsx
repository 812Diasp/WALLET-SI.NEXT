'use client';
import React, { FC, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { API_URL } from "@/app/lib/api";

// Утилиты
const calculateLoanPayment = (principal: number, annualRate: number, years: number) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

interface Transaction {
    id: string;
    type: '0' | '1'; // Изменено на строковые значения '0' и '1'
    category: string;
    amount: number;
    date: string;
    walletId: string;
}

type TransactionFormData = Omit<Transaction, 'id'>;
interface Loan {
    id: string;
    name: string;
    principal: number;
    interestRate: number;
    termYears: number;
    startDate: string;
    walletId: string;
}

interface GuaranteedIncome {
    id: string;
    source: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    walletId: string;
}

interface Stock {
    id: string;
    symbol: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    walletId: string;
}

export default function WalletPage() {
    const theme = useAppSelector(state => state.theme.mode);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const token = useSelector((state: RootState) => state.user.token);
    const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('day');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [guaranteedIncomes, setGuaranteedIncomes] = useState<GuaranteedIncome[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [operationStatus, setOperationStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    // Защита маршрута и загрузка данных
    useEffect(() => {
        if (!token) {
            router.replace('/pages/login');
            return;
        }

        const fetchWalletData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const userId = localStorage.getItem("userId");
                if (!userId) throw new Error("userId не найден");

                const res = await fetch(`${API_URL}/wallet/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Ошибка сети или неверный ответ от сервера");

                const data = await res.json();
                console.log('результат получения тразыков: ', data)
                // Преобразование данных для фронтенда
                const transformedTransactions = (data.transactions || []).map((t: any) => ({
                    ...t,
                    type: t.type.toString() // Преобразуем тип в строку
                }));

                setTransactions(transformedTransactions);
                setLoans(data.Loans || []);
                setGuaranteedIncomes(data.GuaranteedIncomes || []);
                setStocks(data.Stocks || []);

                // Сохранение в localStorage как fallback
                localStorage.setItem('transactions', JSON.stringify(transformedTransactions));
                localStorage.setItem('loans', JSON.stringify(data.Loans || []));
                localStorage.setItem('guaranteedIncomes', JSON.stringify(data.GuaranteedIncomes || []));
                localStorage.setItem('stocks', JSON.stringify(data.Stocks || []));

            } catch (err) {
                console.error('Ошибка при загрузке данных кошелька:', err);
                setError('Не удалось загрузить данные. Попробуйте обновить страницу.');

                // Fallback: загрузка из localStorage
                const tx = localStorage.getItem('transactions');
                const ln = localStorage.getItem('loans');
                const gi = localStorage.getItem('guaranteedIncomes');
                const st = localStorage.getItem('stocks');

                if (tx) setTransactions(JSON.parse(tx));
                if (ln) setLoans(JSON.parse(ln));
                if (gi) setGuaranteedIncomes(JSON.parse(gi));
                if (st) setStocks(JSON.parse(st));
            } finally {
                setIsLoading(false);
            }
        };

        fetchWalletData();
    }, [token, router]);

    // Расчет баланса и данных графика
    useEffect(() => {
        if (transactions.length === 0) return;

        let groupedData: Record<string, { income: number; expenses: number }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            let key: string;

            if (timeRange === 'day') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            } else if (timeRange === 'month') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else { // year
                key = `${date.getFullYear()}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = { income: 0, expenses: 0 };
            }

            if (t.type === '0') {
                groupedData[key].income += t.amount;
            } else {
                groupedData[key].expenses += t.amount;
            }
        });

        const chartData = Object.entries(groupedData)
            .map(([period, values]) => ({
                period,
                income: values.income,
                expenses: values.expenses
            }))
            .sort((a, b) => a.period.localeCompare(b.period));

        setChartData(chartData);
    }, [transactions, timeRange]);

    // Handlers
    const addTransaction = async (tx: TransactionFormData) => {
        try {
            const walletId = localStorage.getItem('walletId');
            if (!walletId) throw new Error('Wallet ID не найден');

            // Формируем данные ТОЧНО как в Swagger
            const requestData = {
                category: tx.category,
                amount: Number(tx.amount),
                date: new Date(tx.date).toISOString(), // Дата в ISO-формате
                type: tx.type, // Тип как строка!
                walletId: walletId // GUID как строка
            };

            console.log('Отправка транзакции:', requestData);

            const response = await fetch(`${API_URL}/wallet/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData) // Отправляем объект напрямую
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении транзакции');
            }

            const newTx = await response.json();
            setTransactions(prev => [...prev, {
                ...newTx,
                type: newTx.type === 0 ? 'income' : 'expense'
            }]);

            setOperationStatus({ type: 'success', message: 'Транзакция добавлена' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({
                type: 'error',
                message: error.message || 'Ошибка при добавлении транзакции'
            });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };
    const removeTransaction = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/wallet/transaction/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка при удалении транзакции');

            setTransactions(prev => prev.filter(t => t.id !== id));
            setOperationStatus({ type: 'success', message: 'Транзакция успешно удалена' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при удалении транзакции' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const addLoan = async (loan: Omit<Loan, 'id'>) => {
        try {
            const walletId = localStorage.getItem('walletId');
            if (!walletId) throw new Error('Wallet ID не найден');

            const response = await fetch(`${API_URL}/wallet/loan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...loan,
                    walletId
                })
            });

            if (!response.ok) throw new Error('Ошибка при добавлении займа');

            const newLoan = await response.json();
            setLoans(prev => [...prev, newLoan]);
            setOperationStatus({ type: 'success', message: 'Займ успешно добавлен' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при добавлении займа' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const deleteLoan = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/wallet/loan/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка при удалении займа');

            setLoans(prev => prev.filter(l => l.id !== id));
            setOperationStatus({ type: 'success', message: 'Займ успешно удален' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при удалении займа' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const addGuaranteedIncome = async (income: Omit<GuaranteedIncome, 'id'>) => {
        try {
            const walletId = localStorage.getItem('walletId');
            if (!walletId) throw new Error('Wallet ID не найден');

            const response = await fetch(`${API_URL}/wallet/guaranteed-income`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...income,
                    walletId
                })
            });

            if (!response.ok) throw new Error('Ошибка при добавлении дохода');

            const newIncome = await response.json();
            setGuaranteedIncomes(prev => [...prev, newIncome]);
            setOperationStatus({ type: 'success', message: 'Доход успешно добавлен' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при добавлении дохода' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const deleteGuaranteedIncome = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/wallet/guaranteed-income/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка при удалении дохода');

            setGuaranteedIncomes(prev => prev.filter(g => g.id !== id));
            setOperationStatus({ type: 'success', message: 'Доход успешно удален' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при удалении дохода' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const addStock = async (stock: Omit<Stock, 'id'>) => {
        try {
            const walletId = localStorage.getItem('walletId');
            if (!walletId) throw new Error('Wallet ID не найден');

            const response = await fetch(`${API_URL}/wallet/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...stock,
                    walletId
                })
            });

            if (!response.ok) throw new Error('Ошибка при добавлении акции');

            const newStock = await response.json();
            setStocks(prev => [...prev, newStock]);
            setOperationStatus({ type: 'success', message: 'Акция успешно добавлена' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при добавлении акции' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const deleteStock = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/wallet/stock/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка при удалении акции');

            setStocks(prev => prev.filter(s => s.id !== id));
            setOperationStatus({ type: 'success', message: 'Акция успешно удалена' });
        } catch (error: any) {
            console.error(error);
            setOperationStatus({ type: 'error', message: error.message || 'Ошибка при удалении акции' });
        } finally {
            setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
        }
    };

    const updateStockPrice = (id: string, price: number) => {
        setStocks(prev => prev.map(s => s.id === id ? { ...s, currentPrice: price } : s));
    };

    // Расчет метрик
    const guaranteedIncomeTotal = guaranteedIncomes.reduce((sum, income) => {
        switch (income.frequency) {
            case 'daily': return sum + income.amount * 30;
            case 'weekly': return sum + income.amount * 4;
            case 'monthly': return sum + income.amount;
            case 'yearly': return sum + income.amount / 12;
            default: return sum;
        }
    }, 0);

    const investmentsYield = stocks.reduce((sum, stock) => {
        return sum + (stock.currentPrice - stock.purchasePrice) * stock.quantity;
    }, 0);

    // Цвета
    const colors = {
        primary: "#00f0ff",
        secondary: "#66f2d5",
        accent1: "#0056ca",
        accent2: "#1d00a1",
        accent3: "#66f2f1",
        expense: "#d62b2b"
    };

    if (!token) {
        return null;
    }

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="text-xl">Загрузка данных кошелька...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 space-y-8 transition-colors duration-500 max-w-6xl mx-auto mt-25`}>
            {operationStatus.type && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${
                        operationStatus.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                >
                    {operationStatus.message}
                </motion.div>
            )}

            <div className={'max-w-6xl mx-auto'}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
                    Balance: {balance.toFixed(2)} ₽
                </motion.div>

                <Section title="Add Transaction">
                    <TransactionForm onSubmit={addTransaction} theme={theme} />
                </Section>

                <Section title="History">
                    <AnimatePresence>
                        {transactions.map(tx => {
                            const date = new Date(tx.date);
                            const formattedDate = date.toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });

                            return (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex justify-between py-2"
                                >
                                    <div>
                                        <span>{formattedDate}</span> · <span>{tx.category}</span>
                                    </div>
                                    <div className="flex gap-2">
                        <span className={tx.type === '1' ? 'text-red-500' : 'text-green-500'}>
                            {tx.type === '1' ? '-' : '+'}{tx.amount.toLocaleString('ru-RU')} ₽
                        </span>
                                        <button onClick={() => removeTransaction(tx.id)}>×</button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </Section>

                <Section title="Metrics & Projections">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total Income"
                            value={transactions.filter(t => t.type === '0').reduce((sum, t) => sum + t.amount, 0)}
                            theme={theme}
                            color={colors.primary}

                        />
                        <MetricCard
                            title="Total Expenses"
                            value={transactions.filter(t => t.type === '1').reduce((sum, t) => sum + t.amount, 0)}
                            theme={theme}
                            color={colors.expense}

                        />
                        <MetricCard
                            title="Guaranteed Income"
                            value={guaranteedIncomeTotal}
                            theme={theme}
                            color={colors.accent1}
                        />
                        <MetricCard
                            title="Investments Yield"
                            value={investmentsYield}
                            theme={theme}
                            color={colors.accent2}
                        />
                    </div>
                </Section>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setTimeRange('day')}
                        className={`px-4 py-2 rounded ${timeRange === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        По дням
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        По месяцам
                    </button>
                    <button
                        onClick={() => setTimeRange('year')}
                        className={`px-4 py-2 rounded ${timeRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        По годам
                    </button>
                </div>

                <Section title="График доходов и расходов">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#555' : '#eee'} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fill: theme === 'dark' ? '#fff' : '#333' }}
                                    tickFormatter={(period) => {
                                        if (timeRange === 'day') {
                                            const [year, month, day] = period.split('-');
                                            return `${day}.${month}`;
                                        } else if (timeRange === 'month') {
                                            const [year, month] = period.split('-');
                                            return `${month}.${year.slice(2)}`;
                                        } else {
                                            return period;
                                        }
                                    }}
                                />
                                <YAxis
                                    tick={{ fill: theme === 'dark' ? '#fff' : '#333' }}
                                    tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                        borderColor: theme === 'dark' ? '#555' : '#ddd'
                                    }}
                                    formatter={(value: number, name: string) => [
                                        `${value.toLocaleString('ru-RU')} ₽`,
                                        name === 'income' ? 'Доходы' : 'Расходы'
                                    ]}
                                    labelFormatter={(period) => {
                                        if (timeRange === 'day') {
                                            const [year, month, day] = period.split('-');
                                            return `Дата: ${day}.${month}.${year}`;
                                        } else if (timeRange === 'month') {
                                            const [year, month] = period.split('-');
                                            return `Месяц: ${month}.${year}`;
                                        } else {
                                            return `Год: ${period}`;
                                        }
                                    }}
                                />
                                <Legend
                                    formatter={(value) => value === 'income' ? 'Доходы' : 'Расходы'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#4CAF50"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Доходы"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#F44336"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Расходы"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold">Общие доходы</h3>
                            <p className="text-green-500 text-xl">
                                {chartData.reduce((sum, item) => sum + item.income, 0).toLocaleString('ru-RU')} ₽
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold">Общие расходы</h3>
                            <p className="text-red-500 text-xl">
                                {chartData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString('ru-RU')} ₽
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold">Баланс</h3>
                            <p className={
                                chartData.reduce((sum, item) => sum + item.income - item.expenses, 0) >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                            }>
                                {chartData.reduce((sum, item) => sum + item.income - item.expenses, 0).toLocaleString('ru-RU')} ₽
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title="Loans & Debts">
                    <LoanForm onSubmit={addLoan} theme={theme} />
                    {loans.map(loan => {
                        const payment = calculateLoanPayment(loan.principal, loan.interestRate, loan.termYears);
                        const totalPayments = loan.termYears * 12 * payment;

                        // Дата начала кредита
                        const startDate = new Date(loan.startDate);
                        const today = new Date();

                        // Количество месяцев с начала кредита
                        const monthsPassed = Math.max(
                            0,
                            (today.getFullYear() - startDate.getFullYear()) * 12 +
                            today.getMonth() -
                            startDate.getMonth()
                        );

                        const paidAmount = monthsPassed * payment;
                        const remainingAmount = totalPayments - paidAmount;

                        // Дата следующего платежа
                        let nextPayment = new Date(startDate.setMonth(startDate.getMonth() + 1));
                        while (nextPayment < today) {
                            nextPayment.setMonth(nextPayment.getMonth() + 1);
                        }

                        return (
                            <div key={loan.id} className="py-2 border-t mt-2 rounded-lg p-4 shadow-sm">
                                <div className="font-semibold">{loan.name}</div>
                                <div>Monthly: {payment.toFixed(2)} ₽</div>

                                <div>Total: {loan.principal.toFixed(2)} ₽</div>

                                {/* Выплачено */}
                                <div className="text-sm">
                                    Should be paid:{" "}
                                    <span className="font-bold text-blue-500">{paidAmount.toFixed(2)} ₽</span>
                                </div>

                                {/* Остаток */}
                                <div className="text-sm">
                                    Remaining:{" "}
                                    <span className="font-bold text-red-500">{remainingAmount.toFixed(2)} ₽</span>
                                </div>

                                <div>Term: {loan.termYears} yrs @ {loan.interestRate}%</div>
                                <div className="text-sm text-gray-500">
                                    Next payment: {nextPayment.toLocaleDateString()}
                                </div>

                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mt-2"
                                    onClick={() => deleteLoan(loan.id)}
                                >
                                    Удалить
                                </button>
                            </div>
                        );
                    })}
                </Section>

                <Section title="Guaranteed Income Sources">
                    <GuaranteedIncomeForm onSubmit={addGuaranteedIncome} theme={theme} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {guaranteedIncomes.map(income => (
                            <motion.div
                                key={income.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-l-4`}
                                style={{ borderColor: colors.accent1 }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{income.source}</h3>
                                        <p className="text-sm text-gray-500">{income.frequency}</p>
                                    </div>
                                    <div className="text-xl font-bold text-green-500">
                                        {income.amount} ₽
                                    </div>
                                </div>
                                <button
                                    className="mt-2 text-red-500 hover:text-red-700"
                                    onClick={() => deleteGuaranteedIncome(income.id)}
                                >
                                    Remove
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                <Section title="Investments">
                    <StockForm onSubmit={addStock} theme={theme} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {stocks.map(stock => {
                            const profit = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
                            const percentChange = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;

                            return (
                                <motion.div
                                    key={stock.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-l-4`}
                                    style={{ borderColor: colors.accent2 }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">{stock.symbol}</h3>
                                            <p className="text-sm text-gray-500">
                                                Quantity: {stock.quantity} |
                                                Purchase: {stock.purchasePrice} ₽
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold">
                                                {stock.currentPrice} ₽
                                            </div>
                                            <div className={`flex items-center ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {profit >= 0 ? (
                                                    <span>↑ {Math.abs(percentChange).toFixed(2)}%</span>
                                                ) : (
                                                    <span>↓ {Math.abs(percentChange).toFixed(2)}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={stock.currentPrice}
                                            onChange={(e) => updateStockPrice(stock.id, parseFloat(e.target.value))}
                                            className={`p-2 border rounded w-1/2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
                                            placeholder="Current price"
                                        />
                                        <button
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => deleteStock(stock.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </Section>
            </div>
        </div>
    );
}

// Компоненты

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b pb-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {children}
    </div>
);

const TransactionForm: FC<{ onSubmit: (tx: TransactionFormData) => void; theme: string }> = ({ onSubmit, theme }) => {
    const [type, setType] = useState<'0' | '1'>('1'); // '0' - income, '1' - expense
    const [category, setCategory] = useState('General');
    const [amount, setAmount] = useState<string>('0');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseInt(amount, 10) || 0;

        // Преобразуем строку даты в объект Date и делаем UTC
        const utcDate = new Date(date);
        utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());

        onSubmit({
            type,
            category,
            amount: numericAmount,
            date: utcDate.toISOString(),
            walletId: localStorage.getItem('walletId') || ''
        });

        setAmount('0');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-2 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        >
            <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as '0' | '1')}
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                >
                    <option value="0" className={'text-green-500'}>Income</option>
                    <option value="1" className={'text-red-500'}>Expense</option>
                </select>
            </div>

            {/* Остальные поля формы остаются без изменений */}
            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={amount}
                    onFocus={() => {
                        const trimmed = amount.replace(/^0+/, '');
                        setAmount(trimmed);
                    }}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setAmount(digits);
                    }}
                    placeholder="Amount"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded mt-2"
            >
                Add
            </button>
        </form>
    );
};


const LoanForm: FC<{ onSubmit: (loan: Omit<Loan, 'id'>) => void; theme: string }> = ({ onSubmit,theme }) => {
    const [name, setName] = useState('');
    const [principal, setPrincipal] = useState(0);
    const [rate, setRate] = useState(5);
    const [term, setTerm] = useState(1);
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            principal,
            interestRate: rate,
            termYears: term,
            startDate,
            walletId: localStorage.getItem('walletId') || '' // Добавлено для бекенда
        });
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Loan Name"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />

            <label>Principal</label>
            <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={principal}
                onFocus={() => {
                    const trimmed = String(principal).replace(/^0+/, '');
                    setPrincipal(trimmed === '' ? 0 : +trimmed);
                }}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPrincipal(value === '' ? 0 : +value);
                }}
                placeholder="Principal"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />

            <label>Annual Rate %</label>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*\.?[0-9]*"
                value={rate}
                onFocus={() => {
                    const trimmed = String(rate).replace(/^0+(\d+)/, '$1');
                    setRate(trimmed === '' ? 0 : +trimmed);
                }}
                onChange={(e) => {
                    let value = e.target.value;
                    // Разрешаем только цифры и максимум одну точку
                    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    setRate(value === '' ? 0 : +value);
                }}
                placeholder="Annual Rate %"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />

            <label>Term Years</label>
            <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={term}
                onFocus={() => {
                    const trimmed = String(term).replace(/^0+(\d+)/, '$1');
                    setTerm(trimmed === '' ? 0 : +trimmed);
                }}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setTerm(value === '' ? 0 : +value);
                }}
                placeholder="Term Years"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />

            <label>Data</label>
            <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />

            <button
                type="submit"
                className="bg-green-600 text-white py-2 rounded"
            >
                Add Loan
            </button>
        </form>
    );
};

const GuaranteedIncomeForm: FC<{ onSubmit: (income: Omit<GuaranteedIncome, 'id'>) => void; theme: string }> = ({ onSubmit, theme }) => {
    const [source, setSource] = useState('');
    const [amount, setAmount] = useState(0);
    const [frequency, setFrequency] = useState<GuaranteedIncome['frequency']>('monthly');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            source,
            amount,
            frequency,
            walletId: localStorage.getItem('walletId') || '' // Добавлено для бекенда
        });
        setSource('');
        setAmount(0);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
            <input
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="Income Source"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={amount}
                onFocus={() => {
                    const trimmed = String(amount).replace(/^0+(\d+)/, '$1');
                    setAmount(trimmed === '' ? 0 : +trimmed);
                }}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAmount(value === '' ? 0 : +value);
                }}
                placeholder="amount"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
            <button
                type="submit"
                className="bg-purple-600 text-white py-2 rounded"
            >
                Add Income Source
            </button>
        </form>
    );
};

const StockForm: FC<{ onSubmit: (stock: Omit<Stock, 'id'>) => void; theme: string }> = ({ onSubmit, theme }) => {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);

    const popularTickers = {
        sectors: {
            energy: {
                stocks: {
                    ru: ['GAZP 🇷🇺', 'LKOH 🇷🇺', 'ROSN 🇷🇺', 'NVTK 🇷🇺'],
                    foreign: ['XOM 🌍', 'CVX 🌍', 'BP 🌍', 'TOTF 🌍']
                },
                futures: {
                    ru: ['Si-6.25 🇷🇺', 'Br-6.25 🇷🇺'],
                    foreign: ['CLH5 🌍', 'NGH5 🌍']
                }
            },
            finance: {
                stocks: {
                    ru: ['SBER 🇷🇺', 'VTBR 🇷🇺', 'MOEX 🇷🇺'],
                    foreign: ['JPM 🌍', 'BMY 🌍', 'GS 🌍', 'HSBC 🌍']
                },
                etf: {
                    ru: ['FXRB 🇷🇺', 'RSX 🇷🇺'],
                    foreign: ['XLF 🌍', 'VFH 🌍']
                }
            },
            tech: {
                stocks: {
                    ru: ['ALRS 🇷🇺', 'MTSS 🇷🇺'],
                    foreign: ['AAPL 🌍', 'MSFT 🌍', 'NVDA 🌍', 'GOOGL 🌍']
                },
                futures: {
                    foreign: ['ESM5 🌍', 'NQM5 🌍']
                }
            },
            consumer: {
                stocks: {
                    ru: ['CHMF 🇷🇺', 'POLY 🇷🇺'],
                    foreign: ['PG 🌍', 'UL 🌍', 'KO 🌍', 'PEP 🌍']
                }
            },
            automotive: {
                stocks: {
                    ru: ['AVTO 🇷🇺'],
                    foreign: ['TM 🌍', 'VWAGY 🌍', 'F 🌍']
                }
            },
            crypto: {
                futures: {
                    foreign: ['BTC-25DEC25 🌍', 'ETH-25DEC25 🌍']
                }
            }
        }
    };
// Добавленная функция handleSubmit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            symbol,
            quantity,
            purchasePrice,
            currentPrice,
            walletId: localStorage.getItem('walletId') || ''
        });

        // Сброс полей после отправки
        setSymbol('');
        setQuantity(0);
        setPurchasePrice(0);
        setCurrentPrice(0);
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
            <div>
                <label className="block text-sm font-medium mb-1">Stock Symbol (e.g., AAPL)</label>
                <input
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    placeholder="Stock Symbol (e.g., AAPL)"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
                <div className="mt-1">
                    <div className="text-xs text-gray-500 mb-2">Popular stocks:</div>

                    <div className="space-y-3 overflow-x-auto pb-2">
                        {Object.entries(popularTickers.sectors).map(([sector, types]) => (
                            <div key={sector} className="border-t pt-2">
                                <h4 className="text-sm font-medium capitalize mb-1">{sector.toUpperCase()}</h4>

                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(types).map(([type, countries]) => (
                                        <div key={type} className="mr-3">
                                            <span className="text-xs text-gray-400">{type.toUpperCase()}</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Object.values(countries).flat().map((ticker) => (
                                                    <button
                                                        key={ticker}
                                                        type="button"
                                                        onClick={() => setSymbol(ticker.split(' ')[0])}
                                                        className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                                            ticker.includes('🇷🇺')
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        } hover:opacity-80 transition`}
                                                    >
                                                        {ticker}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(+e.target.value)}
                    placeholder="Quantity"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(+e.target.value)}
                    placeholder="Purchase Price"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Current Price</label>
                <input
                    type="number"
                    step="0.01"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(+e.target.value)}
                    placeholder="Current Price"
                    className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
            </div>

            <button
                type="submit"
                className="bg-yellow-600 text-white py-2 rounded mt-2"
            >
                Add Stock
            </button>
        </form>
    );
};

const MetricCard: FC<{ title: string; value: number; theme: string; color: string }> = ({ title, value, theme, color }) => {
    const bg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    const textColor = value >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`${bg} p-4 rounded-lg shadow border-l-4`} style={{ borderColor: color }}>
            <div className="text-sm text-gray-500">{title}</div>
            <div className={`text-xl font-bold ${textColor}`}>{value.toFixed(2)}</div>
        </div>
    );
};