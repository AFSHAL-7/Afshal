import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TransactionType } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, formatCurrency }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const date = new Date(data.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const totalActivity = data.Income + data.Expense;

        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-800 dark:text-white mb-2">{formattedDate}</p>
                <p className="text-sm text-green-500 flex justify-between">
                    <span>Income:</span>
                    <span className="font-medium ml-4">{formatCurrency(data.Income)}</span>
                </p>
                <p className="text-sm text-red-500 flex justify-between">
                    <span>Expense:</span>
                    <span className="font-medium ml-4">{formatCurrency(data.Expense)}</span>
                </p>
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                    <span>Total Activity:</span>
                    <span className="ml-4">{formatCurrency(totalActivity)}</span>
                </p>
            </div>
        );
    }
    return null;
};

interface SpendingChartProps {
    transactions: Transaction[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
    const { formatCurrency } = useCurrency();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const data = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dailyIncome = transactions
                .filter(t => t.date.startsWith(date) && t.type === TransactionType.Income)
                .reduce((sum, t) => sum + t.amount, 0);
            const dailyExpense = transactions
                .filter(t => t.date.startsWith(date) && t.type === TransactionType.Expense)
                .reduce((sum, t) => sum + t.amount, 0);
            
            return {
                date: date, // Keep the full date string for filtering
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                Income: dailyIncome,
                Expense: dailyExpense,
            };
        });
    }, [transactions]);

    const handleChartClick = (payload: any) => {
       if (payload && payload.activeTooltipIndex !== undefined) {
            const index = payload.activeTooltipIndex;
            setActiveIndex(prevIndex => (prevIndex === index ? null : index));
        } else {
            setActiveIndex(null);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={data} 
                    margin={{ top: 5, right: 20, left: -10, bottom: 40 }}
                    onClick={handleChartClick}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} />
                    <YAxis 
                        tick={{ fill: 'rgb(107 114 128)' }} 
                        tickFormatter={(value: number) => formatCurrency(value, {
                            notation: 'compact',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 1,
                        })}
                    />
                    <Tooltip
                        content={<CustomTooltip formatCurrency={formatCurrency} />}
                        cursor={{ fill: 'rgba(128, 128, 128, 0.1)', radius: 4 }}
                    />
                    <Legend />
                    <Bar dataKey="Income" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-income-${index}`} cursor="pointer" fill={activeIndex === index ? '#15803d' : '#22c55e'} />
                        ))}
                    </Bar>
                    <Bar dataKey="Expense" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-expense-${index}`} cursor="pointer" fill={activeIndex === index ? '#b91c1c' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;