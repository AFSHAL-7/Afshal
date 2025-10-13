import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface SpendingChartProps {
    transactions: Transaction[];
    onBarClick?: (date: string) => void;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, onBarClick }) => {
    const { formatCurrency } = useCurrency();
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
        if (payload && payload.activePayload && payload.activePayload[0] && onBarClick) {
            // Pass the full date string from the payload
            onBarClick(payload.activePayload[0].payload.date);
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
                        contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            borderColor: '#4b5563',
                            borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#f9fafb' }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} cursor="pointer" />
                    <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;