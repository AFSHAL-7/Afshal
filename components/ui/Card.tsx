import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CardProps {
    title: string;
    amount: number;
    color: string;
}

const Card: React.FC<CardProps> = ({ title, amount, color }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
                {formatCurrency(amount)}
            </p>
        </div>
    );
};

export default Card;