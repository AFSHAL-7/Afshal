import React, { useEffect, useRef } from 'react';
import { Transaction, TransactionCategory, TransactionType } from '../types';

const possibleExpenses = [
    { description: 'Coffee Shop', category: TransactionCategory.Food },
    { description: 'Online Shopping', category: TransactionCategory.Shopping },
    { description: 'Bus Fare', category: TransactionCategory.Transport },
    { description: 'Lunch', category: TransactionCategory.Food },
    { description: 'Spotify Premium', category: TransactionCategory.Entertainment },
    { description: 'Phone Bill', category: TransactionCategory.Bills },
];

export const useMockRealTimeData = (
    isEnabled: boolean,
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
) => {
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isEnabled) {
            intervalRef.current = window.setInterval(() => {
                const randomExpense = possibleExpenses[Math.floor(Math.random() * possibleExpenses.length)];
                const newTransaction: Transaction = {
                    id: `mock-${Date.now()}`,
                    date: new Date().toISOString(),
                    description: randomExpense.description,
                    amount: parseFloat((Math.random() * (50 - 5) + 5).toFixed(2)),
                    type: TransactionType.Expense,
                    category: randomExpense.category,
                    source: 'UPI',
                };

                setTransactions(prev => [newTransaction, ...prev]);
            }, 15000); // Add a new transaction every 15 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled, setTransactions]);
};
