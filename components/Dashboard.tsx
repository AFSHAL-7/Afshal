import React from 'react';
import { Transaction, TransactionType, Budget as BudgetType, TransactionCategory } from '../types';
import SpendingChart from './charts/SpendingChart';
import CategoryPieChart from './charts/CategoryPieChart';
import Card from './ui/Card';
import { TransactionItem } from './ui/TransactionItem';
import FloatingActionButton from './ui/FloatingActionButton';
import Budget from './Budget';

interface DashboardProps {
    transactions: Transaction[];
    budget: BudgetType;
    onAddTransaction: () => void;
    onSetChartFilter: (type: 'date' | 'category', value: string) => void;
    onSetBudget: (category: TransactionCategory, amount: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budget, onAddTransaction, onSetChartFilter, onSetBudget }) => {
    const totalBalance = transactions.reduce((acc, t) => t.type === TransactionType.Income ? acc + t.amount : acc - t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === TransactionType.Income).reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.Expense).reduce((acc, t) => acc + t.amount, 0);
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Balance" amount={totalBalance} color="text-primary" />
                <Card title="Total Income" amount={totalIncome} color="text-green-500" />
                <Card title="Total Expense" amount={totalExpense} color="text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <SpendingChart transactions={transactions} onBarClick={(date) => onSetChartFilter('date', date)} />
                </div>
                <div className="lg:col-span-2">
                    <CategoryPieChart transactions={transactions} onSliceClick={(category) => onSetChartFilter('category', category)} />
                </div>
            </div>

            <Budget 
                transactions={transactions} 
                budget={budget} 
                onSetBudget={onSetBudget} 
                onCategoryClick={(category) => onSetChartFilter('category', category)}
            />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                 <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Transactions</h3>
                 <div className="space-y-4">
                     {recentTransactions.map(transaction => (
                         <TransactionItem key={transaction.id} transaction={transaction} onEdit={() => {}} onDelete={() => {}} isEditable={false}/>
                     ))}
                 </div>
            </div>
            <FloatingActionButton onClick={onAddTransaction} />
        </div>
    );
};

export default Dashboard;