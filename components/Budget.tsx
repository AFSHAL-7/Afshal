import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType, TransactionCategory, Budget as BudgetType } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { EditIcon } from './icons/Icons';

interface BudgetItemProps {
    category: TransactionCategory;
    icon: React.ElementType;
    spent: number;
    budget: number;
    onSetBudget: (category: TransactionCategory, amount: number) => void;
    onOverBudgetClick: (category: TransactionCategory) => void;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ category, icon: Icon, spent, budget, onSetBudget, onOverBudgetClick }) => {
    const { formatCurrency } = useCurrency();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(budget.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = spent > budget && budget > 0;

    const getProgressBarColor = () => {
        if (isOverBudget) return 'bg-red-500';
        if (percentage > 80) return 'bg-yellow-400';
        return 'bg-primary';
    };

    const handleSave = () => {
        const newAmount = parseFloat(inputValue);
        if (!isNaN(newAmount) && newAmount >= 0) {
            onSetBudget(category, newAmount);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setInputValue(budget.toString());
            setIsEditing(false);
        }
    };
    
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        if (!isEditing) {
            setInputValue(budget.toString());
        }
    }, [budget, isEditing]);
    
    const handleClick = () => {
        if (isOverBudget) {
            onOverBudgetClick(category);
        }
    };


    return (
        <div 
            className={`space-y-2 py-1 ${isOverBudget ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-3 px-3 rounded-lg transition-colors duration-150' : ''}`}
            onClick={handleClick}
            role={isOverBudget ? "button" : "listitem"}
            aria-label={isOverBudget ? `View overspent transactions for ${category}` : undefined}
            tabIndex={isOverBudget ? 0 : -1}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        >
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                     <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {formatCurrency(spent, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-gray-400">/</span>
                    {isEditing ? (
                        <div className="relative">
                             <input
                                ref={inputRef}
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                className="w-20 text-right bg-gray-100 dark:bg-gray-700 border border-primary rounded-md py-0.5 px-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent container's click handler
                                setIsEditing(true);
                            }} 
                            className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 hover:text-primary transition-colors"
                        >
                           {formatCurrency(budget, { maximumFractionDigits: 0 })}
                           <EditIcon className="h-3 w-3 opacity-50" />
                        </button>
                    )}
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        </div>
    );
};


interface BudgetProps {
    transactions: Transaction[];
    budget: BudgetType;
    onSetBudget: (category: TransactionCategory, amount: number) => void;
    onCategoryClick: (category: TransactionCategory) => void;
}

const expenseCategories: TransactionCategory[] = [
    TransactionCategory.Food,
    TransactionCategory.Shopping,
    TransactionCategory.Transport,
    TransactionCategory.Bills,
    TransactionCategory.Entertainment,
    TransactionCategory.Health,
    TransactionCategory.Other,
];

const Budget: React.FC<BudgetProps> = ({ transactions, budget, onSetBudget, onCategoryClick }) => {
    const spentByCategory = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyExpenses = transactions.filter(t => 
            t.type === TransactionType.Expense && new Date(t.date) >= firstDayOfMonth
        );

        return monthlyExpenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<TransactionCategory, number>);

    }, [transactions]);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Monthly Budget</h3>
            <div className="space-y-4">
                {expenseCategories.map(category => (
                    <BudgetItem
                        key={category}
                        category={category}
                        icon={getCategoryIcon(category)}
                        spent={spentByCategory[category] || 0}
                        budget={budget[category] || 0}
                        onSetBudget={onSetBudget}
                        onOverBudgetClick={onCategoryClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default Budget;