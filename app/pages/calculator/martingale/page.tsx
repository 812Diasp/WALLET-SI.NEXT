"use client";
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';

type FormData = {
  initialBet: number;
  targetProfit: number;
  rounds: number;
  payout: number;
  method: 'martingale' | 'antiMartingale' | 'dAlembert';
  stopLoss?: number;
};

type BetResult = {
  round: number;
  amount: number;
  cumulative: number;
  profit: number;
  status: 'win' | 'loss';
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const METHOD_DESCRIPTIONS = {
  martingale: "Удваивайте ставку после каждого проигрыша, чтобы покрыть потери и получить прибыль ",
  antiMartingale: "Увеличивайте ставку после выигрыша, чтобы максимизировать прибыль во время удачной полосы",
  dAlembert: "Увеличивайте ставку на фиксированную сумму после проигрыша и уменьшайте после выигрыша",
};

export default function MartingaleCalculator() {
  const theme = useAppSelector((state) => state.theme.mode);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      initialBet: 10,
      targetProfit: 50,
      rounds: 5,
      payout: 2,
      method: 'martingale',
      stopLoss: 0,
    },
  });
  const [results, setResults] = useState<BetResult[]>([]);
  const [totalStats, setTotalStats] = useState({ totalBets: 0, totalProfit: 0, maxDrawdown: 0 });

  const onSubmit = (data: FormData) => {
    const calculatedResults = calculateSequence(data, Array(data.rounds).fill('win'));
    setResults(calculatedResults);
    updateStats(calculatedResults);
  };

  const updateStats = (results: BetResult[]) => {
    const totalBets = results.reduce((sum, r) => sum + r.amount, 0);
    const totalProfit = results[results.length - 1]?.profit || 0;
    const maxDrawdown = Math.min(...results.map(r => r.profit));

    setTotalStats({
      totalBets,
      totalProfit,
      maxDrawdown,
    });
  };

  const toggleResultStatus = (round: number) => {
    const newResults = [...results];
    const index = round - 1;

    if (index >= 0 && index < newResults.length) {
      newResults[index].status = newResults[index].status === 'win' ? 'loss' : 'win';
      const recalculatedResults = recalculateSequence(newResults);
      setResults(recalculatedResults);
      updateStats(recalculatedResults);
    }
  };

  const recalculateSequence = (existingResults: BetResult[]): BetResult[] => {
    const { initialBet, payout, method } = watch();
    const newResults: BetResult[] = [];
    let currentBet = initialBet;
    let cumulative = 0;
    let currentProfit = 0;

    for (let i = 0; i < existingResults.length; i++) {
      const prevResult = i > 0 ? newResults[i-1] : null;

      // Calculate next bet based on previous result and method
      if (i > 0) {
        switch (method) {
          case 'martingale':
            currentBet = prevResult?.status === 'loss' ? currentBet * 2 : initialBet;
            break;
          case 'antiMartingale':
            currentBet = prevResult?.status === 'win' ? currentBet * payout : initialBet;
            break;
          case 'dAlembert':
            currentBet = prevResult?.status === 'loss'
                ? currentBet + initialBet
                : Math.max(initialBet, currentBet - initialBet);
            break;
        }
      }

      currentBet = parseFloat(currentBet.toFixed(2));
      cumulative += currentBet;

      const profitChange = existingResults[i].status === 'win'
          ? currentBet * (payout - 1)
          : -currentBet;

      currentProfit += profitChange;
      currentProfit = parseFloat(currentProfit.toFixed(2));

      newResults.push({
        round: i + 1,
        amount: currentBet,
        cumulative,
        profit: currentProfit,
        status: existingResults[i].status
      });
    }

    return newResults;
  };

  const calculateSequence = (data: FormData, initialStatuses: ('win' | 'loss')[]): BetResult[] => {
    const { initialBet, rounds, payout, method, stopLoss = 0 } = data;
    const res: BetResult[] = [];
    let currentBet = initialBet;
    let cumulative = 0;
    let currentProfit = 0;

    const maxRounds = Math.min(rounds, 50);

    for (let i = 0; i < maxRounds; i++) {
      if (stopLoss > 0 && Math.abs(currentProfit) >= stopLoss) {
        break;
      }

      if (i > 0) {
        switch (method) {
          case 'martingale':
            currentBet = res[i-1].status === 'loss' ? currentBet * 2 : initialBet;
            break;
          case 'antiMartingale':
            currentBet = res[i-1].status === 'win' ? currentBet * payout : initialBet;
            break;
          case 'dAlembert':
            currentBet = res[i-1].status === 'loss'
                ? currentBet + initialBet
                : Math.max(initialBet, currentBet - initialBet);
            break;
        }
      }

      currentBet = parseFloat(currentBet.toFixed(2));
      cumulative += currentBet;

      const status = initialStatuses[i] || 'win';
      const profitChange = status === 'win'
          ? currentBet * (payout - 1)
          : -currentBet;

      currentProfit += profitChange;
      currentProfit = parseFloat(currentProfit.toFixed(2));

      res.push({
        round: i + 1,
        amount: currentBet,
        cumulative,
        profit: currentProfit,
        status
      });
    }
    return res;
  };

  const formatNumber = (num: number) => {
    const absNum = Math.abs(num);

    if (absNum >= 1e15) return (num/1e15).toFixed(2)+'Q';
    if (absNum >= 1e12) return (num/1e12).toFixed(2)+'T';
    if (absNum >= 1e9) return (num/1e9).toFixed(2)+'B';
    if (absNum >= 1e6) return (num/1e6).toFixed(2)+'M';
    if (absNum >= 1e4) return (num/1e3).toFixed(1)+'K';
    if (absNum >= 1e3) return (num/1e3).toFixed(2)+'K';

    if (absNum > 0 && absNum < 0.01) return num.toExponential(2);
    if (absNum > 0 && absNum < 1) return num.toFixed(4);

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    return status === 'win'
        ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100/70'
        : theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100/70';
  };

  const statusTextColor = (status: string) => {
    return status === 'win'
        ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
        : theme === 'dark' ? 'text-red-400' : 'text-red-700';
  };

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const text = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const input = theme === 'dark'
      ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500'
      : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const successColor = theme === 'dark' ? 'text-green-400' : 'text-green-600';
  const dangerColor = theme === 'dark' ? 'text-red-400' : 'text-red-600';

  const currentMethod = watch('method');

  return (
      <motion.div
          className={`min-h-screen py-12 ${bg} transition-colors duration-500 mt-20`}
          initial="hidden"
          animate="visible"
          variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
      >
        <motion.div
            className={`max-w-5xl mx-auto p-6 rounded-2xl shadow-2xl ${cardBg} transition-colors duration-500`}
            variants={cardVariants}
        >
          <motion.h2
              className={`text-3xl font-extrabold mb-6 text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          >
            Калькулятор стратегий
          </motion.h2>

          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/90' : 'bg-blue-50/90'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}>
            <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              {currentMethod === 'martingale' ? 'Мартингейл' :
                  currentMethod === 'antiMartingale' ? 'Анти-Мартингейл' : 'Д’Аламбер'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {METHOD_DESCRIPTIONS[currentMethod]}
              <br/> (клик на кнопку выигрыш/проигрыш для кастомизирования)
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['initialBet', 'targetProfit', 'payout', 'rounds', 'stopLoss'].map((field, idx) => (
                  <motion.div
                      key={field}
                      className="flex flex-col"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1, transition: { delay: 0.1 * idx } }}
                  >
                    <label className={`font-medium mb-2 ${label} flex items-center`}>
                      {field === 'initialBet' ? 'Стартовая ставка' :
                          field === 'targetProfit' ? 'Целевая прибыль' :
                              field === 'payout' ? 'Коэффициент выплаты' :
                                  field === 'rounds' ? 'Количество раундов' : 'Стоп-лосс'}
                    </label>
                    <input
                        {...register(field as any, {
                          required: true,
                          valueAsNumber: true,
                          min: field === 'stopLoss' ? 0 : 0.01,
                          max: field === 'rounds' ? 50 : undefined,
                        })}
                        type="number"
                        step={field === 'payout' ? '0.1' : '1'}
                        min={field === 'payout' ? '1.1' : '0'}
                        className={`w-full border rounded-lg p-3 transition ${input} focus:ring-2 focus:ring-opacity-50`}
                    />
                    {errors[field as keyof FormData] && (
                        <span className="text-red-500 text-sm mt-1">
                    {field === 'rounds' ? 'Максимум 50 раундов' : 'Введите корректное значение'}
                  </span>
                    )}
                  </motion.div>
              ))}

              <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}
                  className="flex flex-col"
              >
                <label className={`font-medium mb-2 ${label}`}>Метод расчёта:</label>
                <Controller
                    name="method"
                    control={control}
                    render={({ field }) => (
                        <motion.select
                            {...field}
                            className={`w-full border rounded-lg p-3 transition ${input} focus:ring-2 focus:ring-opacity-50`}
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.01 }}
                        >
                          <option value="martingale">Мартингейл</option>
                          <option value="antiMartingale">Анти-Мартингейл</option>
                          <option value="dAlembert">Д’Аламбер</option>
                        </motion.select>
                    )}
                />
              </motion.div>
            </div>

            <motion.button
                type="submit"
                className={`w-full py-4 font-semibold rounded-lg ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors shadow-lg`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
              Рассчитать
            </motion.button>
          </form>

          {results.length > 0 && (
              <div className="mt-10">
                <motion.h3
                    className={`text-2xl font-bold mb-6 ${text} text-center`}
                    initial={{ opacity:0 }}
                    animate={{ opacity:1, transition:{delay:0.2} }}
                >
                  Результаты
                </motion.h3>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-8`}>
                  <div className={`p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/80' : 'bg-blue-50/80'} border-l-4 ${totalStats.totalProfit >= 0 ?
                      `${theme === 'dark' ? 'border-green-400' : 'border-green-500'}` :
                      `${theme === 'dark' ? 'border-red-400' : 'border-red-500'}`}`}>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Общая прибыль</div>
                    <div className={`text-2xl font-bold ${totalStats.totalProfit >= 0 ? successColor : dangerColor}`}>
                      {formatNumber(totalStats.totalProfit)}$
                    </div>
                  </div>
                  <div className={`p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/80' : 'bg-blue-50/80'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Всего ставок</div>
                    <div className={`text-2xl font-bold ${text}`}>{formatNumber(totalStats.totalBets)}$</div>
                  </div>
                  <div className={`p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/80' : 'bg-blue-50/80'} border-l-4 ${theme === 'dark' ? 'border-yellow-400' : 'border-yellow-500'}`}>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Макс. просадка</div>
                    <div className={`text-2xl font-bold ${text}`}>{formatNumber(totalStats.maxDrawdown)}$</div>
                  </div>
                </div>

                <div
                    className="rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-lg"
                    style={{ maxHeight: '500px', overflowY: 'auto' }}
                >
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700 sticky top-0' : 'bg-gray-50 sticky top-0'}`}>
                    <tr>
                      <th className={`py-4 px-3 text-left font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} w-20`}>Раунд</th>
                      <th className={`py-4 px-3 text-right font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} w-28`}>Ставка</th>
                      <th className={`py-4 px-3 text-right font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} w-28`}>Сумма</th>
                      <th className={`py-4 px-3 text-right font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} w-28`}>Прибыль</th>
                      <th className={`py-4 px-3 text-right font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} w-32`}>Результат</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((r) => (
                        <motion.tr
                            key={r.round}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, transition: { delay: 0.05 * r.round } }}
                            className={`${getStatusColor(r.status)} hover:${theme === 'dark' ? 'bg-gray-700/40' : 'bg-gray-100/40'}`}
                        >
                          <td className={`py-3 px-3 ${text}`}>{r.round}</td>
                          <td className={`py-3 px-3 text-right ${text}`}>{formatNumber(r.amount)}$</td>
                          <td className={`py-3 px-3 text-right ${text}`}>{formatNumber(r.cumulative)}$</td>
                          <td className={`py-3 px-3 text-right ${r.profit >= 0 ? successColor : dangerColor}`}>
                            {formatNumber(r.profit)}$
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                                onClick={() => toggleResultStatus(r.round)}
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                    r.status === 'win'
                                        ? `${theme === 'dark' ? 'bg-green-900/70 hover:bg-green-900/50 text-green-300' : 'bg-green-100 hover:bg-green-200 text-green-800'}`
                                        : `${theme === 'dark' ? 'bg-red-900/70 hover:bg-red-900/50 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-800'}`
                                }`}
                            >
                              {r.status === 'win' ? 'Выигрыш' : 'Проигрыш'}
                            </button>
                          </td>
                        </motion.tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </motion.div>
      </motion.div>
  );
}