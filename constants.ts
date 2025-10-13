import { Transaction, TransactionCategory, TransactionType, Account, Budget } from './types';
import { GooglePayIcon, PhonePeIcon, BankIcon } from './components/icons/Icons';

export const mockTransactions: Transaction[] = [
    { id: '1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Starbucks Coffee', amount: 5.75, type: TransactionType.Expense, category: TransactionCategory.Food, source: 'UPI', notes: 'Morning coffee before work.', tags: ['coffee', 'morning-routine'] },
    { id: '2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Netflix Subscription', amount: 15.99, type: TransactionType.Expense, category: TransactionCategory.Entertainment, source: 'UPI', tags: ['subscription', 'streaming'] },
    { id: '3', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Monthly Salary', amount: 4500, type: TransactionType.Income, category: TransactionCategory.Salary, source: 'UPI', notes: 'Salary for the current month.' },
    { id: '4', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Grocery Shopping', amount: 124.50, type: TransactionType.Expense, category: TransactionCategory.Food, source: 'UPI', tags: ['groceries', 'home', 'food'] },
    { id: '5', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), description: 'Gas Bill', amount: 75.20, type: TransactionType.Expense, category: TransactionCategory.Bills, source: 'UPI', notes: 'Utility payment for the month.' },
    { id: '6', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Amazon Purchase', amount: 89.99, type: TransactionType.Expense, category: TransactionCategory.Shopping, source: 'UPI' },
    { id: '7', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Uber Ride', amount: 22.30, type: TransactionType.Expense, category: TransactionCategory.Transport, source: 'UPI', tags: ['taxi', 'commute'] },
    { id: '8', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'Freelance Project', amount: 750, type: TransactionType.Income, category: TransactionCategory.Freelance, source: 'Manual', notes: 'Payment for Project X.' },
    { id: '9', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), description: 'Movie Tickets', amount: 32.00, type: TransactionType.Expense, category: TransactionCategory.Entertainment, source: 'Manual', tags: ['cinema', 'leisure'] },
    { id: '10', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'Pharmacy', amount: 18.60, type: TransactionType.Expense, category: TransactionCategory.Health, source: 'UPI' },
    { id: '11', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), description: 'Electricity Bill', amount: 112.40, type: TransactionType.Expense, category: TransactionCategory.Bills, source: 'UPI' },
    { id: '12', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), description: 'Dinner with friends', amount: 95.00, type: TransactionType.Expense, category: TransactionCategory.Food, source: 'Manual', notes: 'Birthday celebration dinner.', tags: ['social', 'restaurant'] },
];

export const mockAccounts: Account[] = [
    { id: 'acc-1', name: 'Google Pay', type: 'UPI', icon: GooglePayIcon },
    { id: 'acc-2', name: 'PhonePe', type: 'UPI', icon: PhonePeIcon },
    { id: 'acc-3', name: 'HDFC Bank', type: 'Bank', icon: BankIcon },
];

export const mockBudget: Budget = {
    [TransactionCategory.Food]: 400,
    [TransactionCategory.Shopping]: 250,
    [TransactionCategory.Transport]: 150,
    [TransactionCategory.Bills]: 200,
    [TransactionCategory.Entertainment]: 100,
    [TransactionCategory.Health]: 50,
    [TransactionCategory.Other]: 75,
};