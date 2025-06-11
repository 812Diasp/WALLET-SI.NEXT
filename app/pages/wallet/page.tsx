// app/pages/wallet/page.tsx
'use client';

import React, {FC, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
// Типы
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
    interestRate: number; // годовая %
    termYears: number;
    startDate: string;
}

// Утилиты
const calculateLoanPayment = (principal: number, annualRate: number, years: number) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export default function WalletPage() {
    const theme = useAppSelector(state => state.theme.mode);
    const dispatch = useAppDispatch(); // если нужны экшены

    // State с загрузкой из localStorage
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);

    // Load из localStorage при монтировании
    useEffect(() => {
        const tx = localStorage.getItem('transactions');
        const ln = localStorage.getItem('loans');
        if (tx) setTransactions(JSON.parse(tx));
        if (ln) setLoans(JSON.parse(ln));
    }, []);

    // Save в localStorage при изменениях
    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);
    useEffect(() => {
        localStorage.setItem('loans', JSON.stringify(loans));
    }, [loans]);

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
    }
    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 space-y-8 transition-colors duration-500 max-w-6xl mx-auto mt-25`}>
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

            <Section title="Income & Expenses Chart">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="income" stroke="#34d399" />
                            <Line type="monotone" dataKey="expenses" stroke="#f87171" />
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
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full" onClick={()=>{deleteLoan(loan.id)}}>
                                Удалить
                            </button>
                        </div>
                    );
                })}
            </Section>

            <Section title="Metrics & Projections">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard title="Total Income" value={transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)} theme={theme} />
                    <MetricCard title="Total Expenses" value={transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)} theme={theme} />
                    <MetricCard title="Guaranteed Income" value={0} theme={theme} />
                    <MetricCard title="Investments Yield" value={0} theme={theme} />
                </div>
            </Section>
        </div>
    );
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {children}
    </div>
);

const TransactionForm: FC<{ onSubmit: (tx: Omit<Transaction, 'id'>) => void; theme: string }> = ({ onSubmit, theme }) => {

    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [category, setCategory] = useState('General');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ type, category, amount, date });
        setAmount(0);
    };

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <select value={type} onChange={e => setType(e.target.value as any)} className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} placeholder="Amount" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded mt-2">Add</button>
        </form>
    );
};

// Форма кредита
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
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Loan Name" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <label>Principal</label>
            <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} placeholder="Principal" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <label>Annual Rate %</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} placeholder="Annual Rate %" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <label>Term Years</label>
            <input type="number" value={term} onChange={e => setTerm(+e.target.value)} placeholder="Term Years" className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <label>Data</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={` p-2 border rounded " ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} />
            <button type="submit" className="bg-green-600 text-white py-2 rounded">Add Loan</button>
        </form>
    );
};

// Карточка метрик
const MetricCard: FC<{ title: string; value: number; theme: string }> = ({ title, value, theme }) => {
    const bg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    return (
        <div className={`${bg} p-4 rounded-lg shadow`}>
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-xl font-bold">{value.toFixed(2)}</div>
        </div>
    );
};
