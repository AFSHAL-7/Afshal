import React from 'react';
import { Transaction, TransactionType } from '../../types';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { EditIcon, DeleteIcon } from '../icons/Icons';
import { useCurrency } from '../../contexts/CurrencyContext';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: () => void;
    onDelete: () => void;
    isEditable: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete, isEditable }) => {
    const { formatCurrency } = useCurrency();
    const { description, category, date, amount, type, source } = transaction;
    const Icon = getCategoryIcon(category);
    const amountColor = type === TransactionType.Income ? 'text-green-500' : 'text-red-500';
    const amountSign = type === TransactionType.Income ? '+' : '-';
    const sourceColor = source === 'UPI' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';

    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{description}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceColor}`}>{source}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className={`font-bold text-lg ${amountColor}`}>
                    {amountSign} {formatCurrency(amount)}
                </p>
                {isEditable && (
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <EditIcon className="h-4 w-4" />
                        </button>
                        <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400">
                            <DeleteIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};