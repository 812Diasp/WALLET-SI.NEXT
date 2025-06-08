"use client";
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';

type FormData = {
  initialBet: number;
  targetProfit: number;
  rounds: number;
  payout: number; // payout multiplier
  method: 'martingale' | 'anti-martingale' | 'dAlembert';
};

type BetResult = {
  amount: number;
  cumulative: number;
  profit: number;
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function MartingaleCalculator() {
  const theme = useAppSelector((state) => state.theme.mode);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      initialBet: 10,
      targetProfit: 50,
      rounds: 5,
      payout: 2,
      method: 'martingale',
    },
  });
  const [results, setResults] = useState<BetResult[]>([]);

  const onSubmit = (data: FormData) => {
    setResults(calculateSequence(data));
  };

  const calculateSequence = (data: FormData): BetResult[] => {
    const { initialBet, rounds, payout, targetProfit, method } = data;
    const res: BetResult[] = [];
    let currentBet = initialBet;
    let cumulative = 0;

    for (let i = 0; i < rounds; i++) {
      switch (method) {
        case 'martingale':
          if (i > 0) {
            const losses = res.slice(0, i).reduce((sum, r) => sum + r.amount, 0);
            currentBet = (losses + targetProfit) / (payout - 1);
          }
          break;
        case 'anti-martingale':
          if (i > 0) currentBet = res[i - 1].amount * payout;
          break;
        case 'dAlembert':
          if (i > 0) currentBet = Math.max(initialBet, res[i - 1].amount + initialBet);
          break;
      }
      currentBet = parseFloat(currentBet.toFixed(2));
      cumulative += currentBet;
      const profit = parseFloat(
        (currentBet * (payout - 1) - (cumulative - currentBet)).toFixed(2)
      );
      res.push({ amount: currentBet, cumulative, profit });
    }
    return res;
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(num);

  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const text = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const input = theme === 'dark'
    ? 'bg-gray-700 text-white border-gray-600'
    : 'bg-white text-gray-900 border-gray-300';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  return (
    <motion.div
      className={`min-h-screen py-12 ${bg} transition-colors duration-500 mt-20`}
      initial="hidden"
      animate="visible"
      variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
    >
      <motion.div
        className={`max-w-xl mx-auto p-6 rounded-2xl shadow-2xl ${cardBg} transition-colors duration-500`}
        variants={cardVariants}
      >
        <motion.h2
          className={`text-3xl font-extrabold mb-6 text-center ${text}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
        >
          Калькулятор ставок
        </motion.h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {['initialBet', 'targetProfit', 'payout', 'rounds'].map((field, idx) => (
            <motion.div
              key={field}
              className="flex flex-col"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { delay: 0.1 * idx } }}
            >
              <label className={`font-medium mb-1 ${label}`}>{field} </label>
              <input
                {...register(field as any, { required: true, valueAsNumber: true })}
                className={`w-full border rounded-lg p-2 transition ${input}`}
                placeholder={field === 'initialBet' ? 'Стартовая ставка' :
                  field === 'targetProfit' ? 'Целевая прибыль' :
                  field === 'payout' ? 'Пайаут' : 'Раундов'}
              />
                {errors[field as keyof FormData] && 'Введите корректное значение'}

            </motion.div>
          ))}

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}>
            <label className={`font-medium mb-1 ${label}`}>Метод расчёта:</label>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <motion.select
                  {...field}
                  className={`w-full border rounded-lg p-2 transition ${input}`}
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="martingale">Мартингейл</option>
                  <option value="anti-martingale">Анти-Мартингейл</option>
                  <option value="dAlembert">Д’Аламбер</option>
                </motion.select>
              )}
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full py-3 font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Рассчитать
          </motion.button>
        </form>

        {results.length > 0 && (
          <div className="mt-8">
            <motion.h3 className={`text-2xl font-bold mb-4 ${text}`} initial={{ opacity:0 }} animate={{ opacity:1, transition:{delay:0.2} }}>
              Результаты:
            </motion.h3>
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  className={`p-4 rounded-xl shadow-lg ${cardBg} border-l-4 border-blue-500`}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { delay: 0.1 * i } }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`text-xl font-medium ${text}`}>Раунд {i + 1}</div>
                  <div className={`${text}`}>Ставка: <span className={'underline'}>{formatNumber(r.amount)}$</span></div>
                  <div className={`${text}`}>Сумма: <span className={'underline'}>{formatNumber(r.cumulative)}$</span></div>
                  <div className={`${text}`}>Прибыль: <span className={'underline'}>{formatNumber(r.profit)}$</span></div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

