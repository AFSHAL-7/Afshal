import React from 'react';

export enum View {
    Dashboard = 'Dashboard',
    Transactions = 'Transactions',
    Insights = 'Insights',
    Settings = 'Settings',
    Profile = 'Profile',
}

export enum TransactionType {
    Income = 'Income',
    Expense = 'Expense',
}

export enum TransactionCategory {
    Food = 'Food',
    Bills = 'Bills',
    Shopping = 'Shopping',
    Transport = 'Transport',
    Entertainment = 'Entertainment',
    Health = 'Health',
    Salary = 'Salary',
    Freelance = 'Freelance',
    Other = 'Other',
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    source: 'Manual' | 'UPI';
    notes?: string;
    tags?: string[];
}

export interface Account {
    id: string;
    name: string;
    type: 'UPI' | 'Bank';
    icon: React.ElementType;
}

export type Budget = {
    [key in TransactionCategory]?: number;
};

export interface CategoryData {
    name: string;
    value: number;
    [key: string]: any;
}

export interface Profile {
    username: string;
    fullName?: string;
    bio?: string;
    avatar?: string; // Base64 encoded image
}