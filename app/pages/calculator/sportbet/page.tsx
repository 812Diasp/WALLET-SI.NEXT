'use client';

import { useAppSelector } from '@/hooks';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetCSVImporter from "@/app/components/BetCSVImporter/BetCSVImporter";
import CSVHelpCard from "@/app/components/BetCSVImporter/CSVHelpCard";

interface BetEntry {
    stake: number;
    odds: number;
    result: 'win' | 'lose';
}

export default function SportBetCalculatorPage() {
    const theme = useAppSelector(state => state.theme.mode);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsTransitioning(true);
        if (transitionRef.current) clearTimeout(transitionRef.current);
        transitionRef.current = setTimeout(() => setIsTransitioning(false), 500);
        return () => { if (transitionRef.current) clearTimeout(transitionRef.current); };
    }, [theme]);
    //из entries все и идет ставки
    const [entries, setEntries] = useState<BetEntry[]>([]);
    const [stake, setStake] = useState('');
    const [odds, setOdds] = useState('');
    const [result, setResult] = useState<'win' | 'lose'>('win');
    const [error, setError] = useState('');

    const totalStaked = entries.reduce((sum, e) => sum + e.stake, 0);
    const totalProfit = entries.reduce((sum, e) => sum + (e.result === 'win' ? e.stake * (e.odds - 1) : -e.stake), 0);
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
    const winCount = entries.filter(e => e.result === 'win').length;
    const winRate = entries.length > 0 ? (winCount / entries.length) * 100 : 0;

    const handleAdd = () => {
        const s = parseFloat(stake.replace(',', '.'));
        const o = parseFloat(odds.replace(',', '.'));

        if (isNaN(s) || isNaN(o) || s <= 0 || o <= 1) {
            setError('Введите корректные значения: stake > 0, odds > 1');
            return;
        }

        setEntries(prev => [...prev, { stake: s, odds: o, result }]);
        setStake('');
        setOdds('');
        setResult('win');
        setError('');
    };

    useEffect(() => {
        const saved = localStorage.getItem('bet-entries');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setEntries(parsed);
                }
            } catch {
                console.error('Ошибка чтения ставок из localStorage');
            }
        }
    }, []);
    useEffect(() => {
        localStorage.setItem('bet-entries', JSON.stringify(entries));
    }, [entries]);
    const handleDelete = (indexToDelete: number) => {
        setEntries(prev => prev.filter((_, i) => i !== indexToDelete));
    };

    const handleExportCSV = () => {
        if (entries.length === 0) return;

        const header = 'stake,odds,result';
        const rows = entries.map(e => `${e.stake},${e.odds},${e.result}`);
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'bets.csv');
        link.click();
        URL.revokeObjectURL(url);
    };


    const bg = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-black';

    return (
        <div className={`min-h-screen p-6 transition-colors duration-500 mt-5 ${bg}`}>
            <h1 className="text-2xl font-bold text-center mb-6">Sport-Bet Calculator</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Form */}
                <div className={`p-6 rounded-lg shadow ${cardBg}`}>
                    <h2 className="text-lg font-semibold mb-4">Add Bet</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Stake"
                            value={stake}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.,]/g, '');
                                setStake(value);
                            }}
                            className={`w-full p-2 border rounded ${textColor}`}
                        />
                        <input
                            type="text"
                            placeholder="Odds"
                            value={odds}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.,]/g, '');
                                setOdds(value);
                            }}
                            className={`w-full p-2 border rounded ${textColor}`}
                        />
                        <select
                            value={result}
                            onChange={e => setResult(e.target.value as any)}
                            className={`w-full p-2 border rounded text-black`}
                        >
                            <option value="win" className={'text-green-600'}>Win</option>
                            <option value="lose"  className={'text-red-600'}>Lose</option>
                        </select>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button
                            onClick={handleAdd}
                            className={`w-full py-2 rounded ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            Add Bet
                        </button>
                        <BetCSVImporter
                            theme={theme}
                            onImport={(importedEntries) => {
                                setEntries(prev => [...prev, ...importedEntries]);
                            }}
                        />
                        <button
                            onClick={handleExportCSV}
                            className={`w-full py-2 rounded ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-700 hover:bg-green-600'} text-white`}
                        >
                            Сохранить ставки в CSV
                        </button>

                    </div>

                        <div className={`mt-6 p-4 rounded-lg ${cardBg}`}>
                            <p className={'m-1'}>Total Bets: {entries.length}</p>
                            <p className={'m-1'}>Total Staked: {totalStaked.toFixed(2)}</p>

                            <p className={'m-1'}>ROI: {roi.toFixed(2)}%</p>
                            <p className={'m-1'}>Win Rate: {winRate.toFixed(2)}%</p>
                            <hr/>
                            <p className={'m-1'}>Total Profit: {totalProfit.toFixed(2)}</p>
                        </div>


                </div>

                {/* Entries List */}
                <div className={`rounded-lg shadow ${cardBg} p-4`}>
                    <h2 className="text-lg font-semibold mb-4">Your Bets</h2>
                    <div className="overflow-y-auto max-h-[500px] divide-y">
                        <div className="grid grid-cols-5 font-semibold p-2">
                            <span>Stake</span>
                            <span>Odds</span>
                            <span>Result</span>
                            <span>Total</span>
                            <span> </span>
                        </div>
                        <AnimatePresence>
                            {entries.map((e, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`grid grid-cols-5 items-center px-2 py-2 text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                >
                                    <span>{e.stake}</span>
                                    <span>{e.odds}</span>
                                    <span className={`${e.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                        {e.result.toUpperCase()}
                                    </span>
                                    <span>{e.result==='win' ? e.stake*e.odds  : 0-e.stake}</span>
                                    <span
                                        onClick={() => handleDelete(idx)}
                                        className="bg-red-500 hover:bg-red-700 text-white p-1 text-center rounded-lg cursor-pointer"
                                    >
                                        Удалить
                                    </span>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {entries.length === 0 && (
                            <div className="text-sm text-center text-gray-400 py-4">No bets yet</div>
                        )}
                    </div>
                </div>

            </div>
            <div className={`max-w-6xl mx-auto`}>
                <CSVHelpCard theme={theme} />
            </div>


        </div>
    );
}
