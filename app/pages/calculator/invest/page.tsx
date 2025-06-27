'use client';

import { useAppSelector } from '@/hooks';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CalculatorType = 'dividend' | 'compound' | 'stock-growth';

interface Calculation {
    id: string;
    type: CalculatorType;
    inputs: any;
    result: any;
    timestamp: number;
}

interface DividendInputs {
    shares: number;
    dividendPerShare: number;
    frequency: 'monthly' | 'quarterly' | 'annually';
}

interface CompoundInputs {
    initialAmount: number;
    monthlyContribution: number;
    annualRate: number;
    years: number;
}

interface StockGrowthInputs {
    initialPrice: number;
    finalPrice: number;
    shares: number;
    years: number;
}

export default function InvestmentCalculatorPage() {
    const theme = useAppSelector(state => state.theme.mode);
    const [calculatorType, setCalculatorType] = useState<CalculatorType>('dividend');
    const [savedCalculations, setSavedCalculations] = useState<Calculation[]>([]);

    // Dividend calculator state
    const [dividendInputs, setDividendInputs] = useState<DividendInputs>({
        shares: 100,
        dividendPerShare: 0.5,
        frequency: 'quarterly'
    });

    // Compound interest calculator state
    const [compoundInputs, setCompoundInputs] = useState<CompoundInputs>({
        initialAmount: 1000,
        monthlyContribution: 100,
        annualRate: 7,
        years: 10
    });

    // Stock growth calculator state
    const [stockGrowthInputs, setStockGrowthInputs] = useState<StockGrowthInputs>({
        initialPrice: 100,
        finalPrice: 150,
        shares: 10,
        years: 5
    });

    // Load saved calculations from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('investment-calculations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSavedCalculations(parsed);
                }
            } catch {
                console.error('Ошибка чтения расчетов из localStorage');
            }
        }
    }, []);

    // Save calculations to localStorage
    useEffect(() => {
        localStorage.setItem('investment-calculations', JSON.stringify(savedCalculations));
    }, [savedCalculations]);

    // Calculate dividend income
    const calculateDividend = () => {
        const { shares, dividendPerShare, frequency } = dividendInputs;
        const annualIncome = shares * dividendPerShare;

        let periodicIncome = 0;
        if (frequency === 'monthly') periodicIncome = annualIncome / 12;
        else if (frequency === 'quarterly') periodicIncome = annualIncome / 4;
        else periodicIncome = annualIncome;

        return {
            annualIncome,
            periodicIncome
        };
    };

    // Calculate compound interest
    const calculateCompound = () => {
        const { initialAmount, monthlyContribution, annualRate, years } = compoundInputs;
        const monthlyRate = annualRate / 100 / 12;
        const months = years * 12;

        let futureValue = initialAmount;
        for (let i = 0; i < months; i++) {
            futureValue = futureValue * (1 + monthlyRate) + monthlyContribution;
        }

        return {
            futureValue,
            totalContributions: initialAmount + (monthlyContribution * months)
        };
    };

    // Calculate stock growth
    const calculateStockGrowth = () => {
        const { initialPrice, finalPrice, shares, years } = stockGrowthInputs;
        const initialValue = initialPrice * shares;
        const finalValue = finalPrice * shares;
        const profit = finalValue - initialValue;
        const annualGrowth = ((finalPrice / initialPrice) ** (1 / years) - 1) * 100;

        return {
            initialValue,
            finalValue,
            profit,
            annualGrowth
        };
    };

    // Save current calculation
    const saveCalculation = () => {
        let result, inputs;

        switch (calculatorType) {
            case 'dividend':
                result = calculateDividend();
                inputs = dividendInputs;
                break;
            case 'compound':
                result = calculateCompound();
                inputs = compoundInputs;
                break;
            case 'stock-growth':
                result = calculateStockGrowth();
                inputs = stockGrowthInputs;
                break;
        }

        const newCalculation: Calculation = {
            id: Date.now().toString(),
            type: calculatorType,
            inputs,
            result,
            timestamp: Date.now()
        };

        setSavedCalculations(prev => [newCalculation, ...prev]);
    };

    // Delete a saved calculation
    const deleteCalculation = (id: string) => {
        setSavedCalculations(prev => prev.filter(calc => calc.id !== id));
    };

    const bg = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black';

    return (
        <div className={`min-h-screen p-6 transition-colors duration-500 mt-26 ${bg}`}>
            <h1 className="text-2xl font-bold text-center mb-6">Калькулятор инвестиций</h1>

            {/* Calculator Type Selector */}
            <div className="flex justify-center mb-6">
                <select
                    value={calculatorType}
                    onChange={(e) => setCalculatorType(e.target.value as CalculatorType)}
                    className={`p-2 rounded ${inputBg}`}
                >
                    <option value="dividend">Дивидендный калькулятор</option>
                    <option value="compound">Калькулятор сложных процентов</option>
                    <option value="stock-growth">Калькулятор роста акций</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Calculator Form */}
                <div className={`p-6 rounded-lg shadow ${cardBg}`}>
                    <h2 className="text-lg font-semibold mb-4">
                        {calculatorType === 'dividend' && 'Дивидендный доход'}
                        {calculatorType === 'compound' && 'Сложные проценты'}
                        {calculatorType === 'stock-growth' && 'Рост стоимости акций'}
                    </h2>

                    {/* Dividend Calculator Form */}
                    {calculatorType === 'dividend' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">Количество акций</label>
                                <input
                                    type="number"
                                    value={dividendInputs.shares}
                                    onChange={(e) => setDividendInputs({
                                        ...dividendInputs,
                                        shares: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Дивиденды на акцию ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={dividendInputs.dividendPerShare}
                                    onChange={(e) => setDividendInputs({
                                        ...dividendInputs,
                                        dividendPerShare: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Частота выплат</label>
                                <select
                                    value={dividendInputs.frequency}
                                    onChange={(e) => setDividendInputs({
                                        ...dividendInputs,
                                        frequency: e.target.value as any
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                >
                                    <option value="monthly">Ежемесячно</option>
                                    <option value="quarterly">Ежеквартально</option>
                                    <option value="annually">Ежегодно</option>
                                </select>
                            </div>

                            <button
                                onClick={saveCalculation}
                                className={`w-full py-2 rounded ${
                                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                                } text-white`}
                            >
                                Рассчитать и сохранить
                            </button>

                            <div className={`mt-4 p-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className="font-semibold mb-2">Результат:</h3>
                                <p>Годовой доход: ${calculateDividend().annualIncome.toFixed(2)}</p>
                                <p>
                                    {dividendInputs.frequency === 'monthly' && 'Ежемесячный доход: '}
                                    {dividendInputs.frequency === 'quarterly' && 'Ежеквартальный доход: '}
                                    {dividendInputs.frequency === 'annually' && 'Ежегодный доход: '}
                                    ${calculateDividend().periodicIncome.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Compound Interest Calculator Form */}
                    {calculatorType === 'compound' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">Начальная сумма ($)</label>
                                <input
                                    type="number"
                                    value={compoundInputs.initialAmount}
                                    onChange={(e) => setCompoundInputs({
                                        ...compoundInputs,
                                        initialAmount: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Ежемесячное пополнение ($)</label>
                                <input
                                    type="number"
                                    value={compoundInputs.monthlyContribution}
                                    onChange={(e) => setCompoundInputs({
                                        ...compoundInputs,
                                        monthlyContribution: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Годовая процентная ставка (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={compoundInputs.annualRate}
                                    onChange={(e) => setCompoundInputs({
                                        ...compoundInputs,
                                        annualRate: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Срок инвестирования (лет)</label>
                                <input
                                    type="number"
                                    value={compoundInputs.years}
                                    onChange={(e) => setCompoundInputs({
                                        ...compoundInputs,
                                        years: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <button
                                onClick={saveCalculation}
                                className={`w-full py-2 rounded ${
                                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                                } text-white`}
                            >
                                Рассчитать и сохранить
                            </button>

                            <div className={`mt-4 p-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className="font-semibold mb-2">Результат:</h3>
                                <p>Будущая стоимость: ${calculateCompound().futureValue.toFixed(2)}</p>
                                <p>Всего вложено: ${calculateCompound().totalContributions.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    {/* Stock Growth Calculator Form */}
                    {calculatorType === 'stock-growth' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">Начальная цена акции ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={stockGrowthInputs.initialPrice}
                                    onChange={(e) => setStockGrowthInputs({
                                        ...stockGrowthInputs,
                                        initialPrice: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Конечная цена акции ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={stockGrowthInputs.finalPrice}
                                    onChange={(e) => setStockGrowthInputs({
                                        ...stockGrowthInputs,
                                        finalPrice: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Количество акций</label>
                                <input
                                    type="number"
                                    value={stockGrowthInputs.shares}
                                    onChange={(e) => setStockGrowthInputs({
                                        ...stockGrowthInputs,
                                        shares: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Период владения (лет)</label>
                                <input
                                    type="number"
                                    value={stockGrowthInputs.years}
                                    onChange={(e) => setStockGrowthInputs({
                                        ...stockGrowthInputs,
                                        years: Number(e.target.value)
                                    })}
                                    className={`w-full p-2 border rounded ${inputBg}`}
                                />
                            </div>

                            <button
                                onClick={saveCalculation}
                                className={`w-full py-2 rounded ${
                                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                                } text-white`}
                            >
                                Рассчитать и сохранить
                            </button>

                            <div className={`mt-4 p-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className="font-semibold mb-2">Результат:</h3>
                                <p>Прибыль: ${calculateStockGrowth().profit.toFixed(2)}</p>
                                <p>Годовой рост: {calculateStockGrowth().annualGrowth.toFixed(2)}%</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Saved Calculations */}
                <div className={`rounded-lg shadow ${cardBg} p-4`}>
                    <h2 className="text-lg font-semibold mb-4">Сохраненные расчеты</h2>

                    <div className="overflow-y-auto max-h-[500px] divide-y">
                        {savedCalculations.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Нет сохраненных расчетов</div>
                        ) : (
                            <AnimatePresence>
                                {savedCalculations.map((calc) => (
                                    <motion.div
                                        key={calc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded mb-2`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold">
                                                    {calc.type === 'dividend' && 'Дивидендный доход'}
                                                    {calc.type === 'compound' && 'Сложные проценты'}
                                                    {calc.type === 'stock-growth' && 'Рост акций'}
                                                </div>

                                                {calc.type === 'dividend' && (
                                                    <div className="text-sm">
                                                        Акций: {calc.inputs.shares}, Дивиденд: ${calc.inputs.dividendPerShare},
                                                        Частота: {calc.inputs.frequency === 'monthly' ? 'Ежемесячно' :
                                                        calc.inputs.frequency === 'quarterly' ? 'Ежеквартально' :
                                                            'Ежегодно'}
                                                    </div>
                                                )}

                                                {calc.type === 'compound' && (
                                                    <div className="text-sm">
                                                        Начало: ${calc.inputs.initialAmount},
                                                        Пополнение: ${calc.inputs.monthlyContribution}/мес,
                                                        Ставка: {calc.inputs.annualRate}%,
                                                        Лет: {calc.inputs.years}
                                                    </div>
                                                )}

                                                {calc.type === 'stock-growth' && (
                                                    <div className="text-sm">
                                                        Нач. цена: ${calc.inputs.initialPrice},
                                                        Кон. цена: ${calc.inputs.finalPrice},
                                                        Акций: {calc.inputs.shares},
                                                        Лет: {calc.inputs.years}
                                                    </div>
                                                )}

                                                <div className="mt-2">
                                                    <span className="font-semibold">Результат: </span>
                                                    {calc.type === 'dividend' && (
                                                        <span>${calc.result.periodicIncome.toFixed(2)} за период</span>
                                                    )}
                                                    {calc.type === 'compound' && (
                                                        <span>${calc.result.futureValue.toFixed(2)}</span>
                                                    )}
                                                    {calc.type === 'stock-growth' && (
                                                        <span>Прибыль ${calc.result.profit.toFixed(2)} ({calc.result.annualGrowth.toFixed(2)}% годовых)</span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => deleteCalculation(calc.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {savedCalculations.length > 0 && (
                        <button
                            onClick={() => setSavedCalculations([])}
                            className={`w-full mt-4 py-2 rounded ${
                                theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                        >
                            Удалить все расчеты
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}