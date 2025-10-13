import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType, CategoryData } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CategoryPieChartProps {
    transactions: Transaction[];
    onSliceClick?: (category: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions, onSliceClick }) => {
    const { formatCurrency } = useCurrency();
    const data: CategoryData[] = useMemo(() => {
        const expenseByCategory = transactions
            .filter(t => t.type === TransactionType.Expense)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(expenseByCategory)
            .map(([name, value]) => ({ name, value }))
            // Fix: Explicitly type sort arguments to resolve potential type inference issues.
            .sort((a: CategoryData, b: CategoryData) => b.value - a.value);
    }, [transactions]);
    
    const handleSliceClick = (payload: any) => {
        if (payload && onSliceClick) {
            onSliceClick(payload.name);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        cursor="pointer"
                        onClick={handleSliceClick}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
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
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryPieChart;