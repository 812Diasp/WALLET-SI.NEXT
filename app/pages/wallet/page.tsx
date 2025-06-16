'use client';
import React, { FC, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

// Утилиты
const calculateLoanPayment = (principal: number, annualRate: number, years: number) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

interface Transaction {
    id: string;
    type: 'expense' | 'income';
    category: string;
    amount: number;
    date: string;
}

interface Loan {
    id: string;
    name: string;
    principal: number;
    interestRate: number;
    termYears: number;
    startDate: string;
}

interface GuaranteedIncome {
    id: string;
    source: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface Stock {
    id: string;
    symbol: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
}

export default function WalletPage() {
    const theme = useAppSelector(state => state.theme.mode);
    const dispatch = useAppDispatch();

    // State с загрузкой из localStorage
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [guaranteedIncomes, setGuaranteedIncomes] = useState<GuaranteedIncome[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);

    // Load из localStorage при монтировании
    useEffect(() => {
        const tx = localStorage.getItem('transactions');
        const ln = localStorage.getItem('loans');
        const gi = localStorage.getItem('guaranteedIncomes');
        const st = localStorage.getItem('stocks');

        if (tx) setTransactions(JSON.parse(tx));
        if (ln) setLoans(JSON.parse(ln));
        if (gi) setGuaranteedIncomes(JSON.parse(gi));
        if (st) setStocks(JSON.parse(st));
    }, []);

    // Защита маршрута
    const router = useRouter();
    const token = useSelector((state: RootState) => state.user.token);
    useEffect(() => {
        if (!token) {
            router.replace('/pages/login');
        }
    }, [token, router]);

    if (!token) {
        return null;
    }

    // Сохранение в localStorage при изменениях
    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('loans', JSON.stringify(loans));
    }, [loans]);

    useEffect(() => {
        localStorage.setItem('guaranteedIncomes', JSON.stringify(guaranteedIncomes));
    }, [guaranteedIncomes]);

    useEffect(() => {
        localStorage.setItem('stocks', JSON.stringify(stocks));
    }, [stocks]);

    // Расчет баланса и данных графика
    useEffect(() => {
        let incomeSum = 0;
        let expenseSum = 0;

        transactions.forEach(t => {
            if (t.type === 'income') incomeSum += t.amount;
            else expenseSum += t.amount;
        });

        setBalance(incomeSum - expenseSum);

        const grouped: Record<string, { income: number; expenses: number }> = {};
        transactions.forEach(t => {
            const day = t.date;
            if (!grouped[day]) grouped[day] = { income: 0, expenses: 0 };
            grouped[day][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
        });

        const data = Object.entries(grouped).map(([day, vals]) => ({ day, ...vals }));
        setChartData(data);
    }, [transactions]);

    // Handlers
    const addTransaction = (tx: Omit<Transaction, 'id'>) => {
        setTransactions(prev => [...prev, { ...tx, id: uuidv4() }]);
    };

    const removeTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = (id: string, changes: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? ({ ...t, ...changes }) : t));
    };

    const addLoan = (loan: Omit<Loan, 'id'>) => {
        setLoans(prev => [...prev, { ...loan, id: uuidv4() }]);
    };

    const deleteLoan = (id: string) => {
        setLoans(prev => prev.filter(t => t.id !== id));
    };

    const addGuaranteedIncome = (income: Omit<GuaranteedIncome, 'id'>) => {
        setGuaranteedIncomes(prev => [...prev, { ...income, id: uuidv4() }]);
    };

    const deleteGuaranteedIncome = (id: string) => {
        setGuaranteedIncomes(prev => prev.filter(t => t.id !== id));
    };

    const addStock = (stock: Omit<Stock, 'id'>) => {
        setStocks(prev => [...prev, { ...stock, id: uuidv4() }]);
    };

    const deleteStock = (id: string) => {
        setStocks(prev => prev.filter(t => t.id !== id));
    };

    const updateStockPrice = (id: string, price: number) => {
        setStocks(prev => prev.map(s => s.id === id ? ({ ...s, currentPrice: price }) : s));
    };

    // Расчет метрик
    const guaranteedIncomeTotal = guaranteedIncomes.reduce((sum, income) => {
        // Конвертация всех доходов в месячный эквивалент
        switch (income.frequency) {
            case 'daily': return sum + income.amount * 30;
            case 'weekly': return sum + income.amount * 4;
            case 'monthly': return sum + income.amount;
            case 'yearly': return sum + income.amount / 12;
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
        accent3: "#66f2f1"
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 space-y-8 transition-colors duration-500 max-w-6xl mx-auto mt-25`}>
            <div className={'max-w-6xl mx-auto'}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
                    Balance: {balance.toFixed(2)} ₽
                </motion.div>

                <Section title="Add Transaction">
                    <TransactionForm onSubmit={addTransaction} theme={theme} />
                </Section>

                <Section title="History">
                    <AnimatePresence>
                        {transactions.map(tx => (
                            <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-between py-2">
                                <div>
                                    <span>{tx.date}</span> · <span>{tx.category}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                                        {tx.amount} ₽
                                    </span>
                                    <button onClick={() => removeTransaction(tx.id)}>×</button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Section>

                <Section title="Metrics & Projections">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total Income"
                            value={transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)}
                            theme={theme}
                            color={colors.primary}
                        />
                        <MetricCard
                            title="Total Expenses"
                            value={transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)}
                            theme={theme}
                            color={colors.secondary}
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

                <Section title="Income & Expenses Chart">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="income" stroke={colors.primary} />
                                <Line type="monotone" dataKey="expenses" stroke={colors.secondary} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Section>

                <Section title="Loans & Debts">
                    <LoanForm onSubmit={addLoan} theme={theme} />
                    {loans.map(loan => {
                        const payment = calculateLoanPayment(loan.principal, loan.interestRate, loan.termYears);
                        return (
                            <div key={loan.id} className="py-2">
                                <div className="font-semibold">{loan.name}</div>
                                <div>Monthly: {payment.toFixed(2)} ₽</div>
                                <div>Term: {loan.termYears} yrs @ {loan.interestRate}%</div>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                                    onClick={()=>{deleteLoan(loan.id)}}>
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

const TransactionForm: FC<{ onSubmit: (tx: Omit<Transaction, 'id'>) => void; theme: string }> = ({ onSubmit, theme }) => {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [category, setCategory] = useState('General');
    const [amount, setAmount] = useState<string>('0');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseInt(amount, 10) || 0;
        onSubmit({ type, category, amount: numericAmount, date });
        setAmount('0');
    };

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>
            <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Category"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={amount}
                onFocus={() => {
                    const trimmed = amount.replace(/^0+/, '');
                    setAmount(trimmed);
                }}
                onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setAmount(digits);
                }}
                placeholder="Amount"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
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
        onSubmit({ name, principal, interestRate: rate, termYears: term, startDate });
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
                type="number"
                value={principal}
                onChange={e => setPrincipal(+e.target.value)}
                placeholder="Principal"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <label>Annual Rate %</label>
            <input
                type="number"
                step="0.1"
                value={rate}
                onChange={e => setRate(+e.target.value)}
                placeholder="Annual Rate %"
                className={`p-2 border rounded ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            />
            <label>Term Years</label>
            <input
                type="number"
                value={term}
                onChange={e => setTerm(+e.target.value)}
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
        onSubmit({ source, amount, frequency });
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
                type="number"
                value={amount}
                onChange={e => setAmount(+e.target.value)}
                placeholder="Amount"
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ symbol, quantity, purchasePrice, currentPrice });
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