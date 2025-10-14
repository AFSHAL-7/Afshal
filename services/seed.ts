import { supabase } from './supabase';
import { Transaction, TransactionType, TransactionCategory, Account, Budget } from '../types';
import { GooglePayIcon, BankIcon } from '../components/icons/Icons';
import type { User } from '@supabase/supabase-js';

const mockAccounts = [
    { name: 'Google Pay', type: 'UPI', icon: 'GooglePayIcon' },
    { name: 'HDFC Bank', type: 'Bank', icon: 'BankIcon' }
];

const mockBudgets = [
    { category: TransactionCategory.Food, amount: 15000 },
    { category: TransactionCategory.Shopping, amount: 20000 },
    { category: TransactionCategory.Transport, amount: 5000 },
    { category: TransactionCategory.Bills, amount: 10000 },
    { category: TransactionCategory.Entertainment, amount: 7000 },
];

const generateMockTransactions = (): Omit<Transaction, 'id' | 'user_id'>[] => {
    const transactions = [];
    const today = new Date();

    // Salary income
    transactions.push({
        date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        description: 'Monthly Salary',
        amount: 85000,
        type: TransactionType.Income,
        category: TransactionCategory.Salary,
        source: 'Manual'
    });

    // Generate expenses for the last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        // Randomly add 1 to 3 transactions per day
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
            const expenseCategories = [
                TransactionCategory.Food, TransactionCategory.Shopping, TransactionCategory.Transport,
                TransactionCategory.Bills, TransactionCategory.Entertainment, TransactionCategory.Health,
                TransactionCategory.Other
            ];
            const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            let description = '';
            let amount = 0;

            switch (category) {
                case TransactionCategory.Food:
                    description = ['Groceries from Blinkit', 'Zomato Order', 'Swiggy Dinner', 'Cafe Coffee Day'][Math.floor(Math.random() * 4)];
                    amount = Math.floor(Math.random() * 800) + 100;
                    break;
                case TransactionCategory.Shopping:
                    description = ['Myntra Shopping', 'Amazon Purchase', 'Flipkart Order'][Math.floor(Math.random() * 3)];
                    amount = Math.floor(Math.random() * 3000) + 500;
                    break;
                case TransactionCategory.Transport:
                    description = ['Uber Ride', 'Ola Cab', 'Metro Card Recharge'][Math.floor(Math.random() * 3)];
                    amount = Math.floor(Math.random() * 400) + 50;
                    break;
                case TransactionCategory.Bills:
                    description = ['Electricity Bill', 'Wi-Fi Bill', 'Phone Recharge'][Math.floor(Math.random() * 3)];
                    amount = Math.floor(Math.random() * 1500) + 300;
                    break;
                case TransactionCategory.Entertainment:
                    description = ['Netflix Subscription', 'Movie Tickets', 'Spotify Premium'][Math.floor(Math.random() * 3)];
                    amount = Math.floor(Math.random() * 600) + 200;
                    break;
                case TransactionCategory.Health:
                    description = ['Pharmacy', 'Doctor Visit'][Math.floor(Math.random() * 2)];
                    amount = Math.floor(Math.random() * 1000) + 150;
                    break;
                default:
                    description = 'Miscellaneous Expense';
                    amount = Math.floor(Math.random() * 500) + 50;
            }

            transactions.push({
                date: date.toISOString(),
                description,
                amount,
                type: TransactionType.Expense,
                category,
                source: Math.random() > 0.5 ? 'UPI' : 'Manual'
            });
        }
    }
    return transactions;
};

export const seedDatabase = async (user: User) => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    // 1. Delete existing data for the user
    console.log("Deleting existing data...");
    const { error: deleteTransactionsError } = await supabase.from('transactions').delete().eq('user_id', user.id);
    if (deleteTransactionsError) throw deleteTransactionsError;

    const { error: deleteAccountsError } = await supabase.from('accounts').delete().eq('user_id', user.id);
    if (deleteAccountsError) throw deleteAccountsError;

    const { error: deleteBudgetError } = await supabase.from('budget').delete().eq('user_id', user.id);
    if (deleteBudgetError) throw deleteBudgetError;
    console.log("Existing data deleted.");

    // 2. Insert mock accounts
    console.log("Inserting mock accounts...");
    const accountsToInsert = mockAccounts.map(acc => ({ ...acc, user_id: user.id }));
    const { error: insertAccountsError } = await supabase.from('accounts').insert(accountsToInsert);
    if (insertAccountsError) throw insertAccountsError;
    console.log("Mock accounts inserted.");

    // 3. Insert mock budgets
    console.log("Inserting mock budgets...");
    const budgetsToInsert = mockBudgets.map(b => ({ ...b, user_id: user.id }));
    const { error: insertBudgetError } = await supabase.from('budget').insert(budgetsToInsert);
    if (insertBudgetError) throw insertBudgetError;
    console.log("Mock budgets inserted.");

    // 4. Insert mock transactions
    console.log("Inserting mock transactions...");
    const transactionsToInsert = generateMockTransactions().map(t => ({ ...t, user_id: user.id }));
    const { error: insertTransactionsError } = await supabase.from('transactions').insert(transactionsToInsert);
    if (insertTransactionsError) throw insertTransactionsError;
    console.log("Mock transactions inserted.");

    console.log("Database seeding completed successfully!");
};
