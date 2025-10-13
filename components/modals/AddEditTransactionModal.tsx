import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Transaction, TransactionType, TransactionCategory } from '../../types';

interface AddEditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'source'>) => void;
    transaction: Transaction | null;
}

const AddEditTransactionModal: React.FC<AddEditTransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.Food);

    useEffect(() => {
        if (isOpen && transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setDate(new Date(transaction.date).toISOString().split('T')[0]);
            setType(transaction.type);
            setCategory(transaction.category);
        } else if (isOpen) {
            // Reset for new transaction
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setType(TransactionType.Expense);
            setCategory(TransactionCategory.Food);
        }
    }, [isOpen, transaction]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        
        // Validate the description and amount fields
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please provide a valid description and a positive amount.');
            return;
        }

        // Call the onSave prop with the formatted transaction data.
        // The parent component will handle whether to add a new transaction
        // or update an existing one.
        onSave({ 
            description: description.trim(), 
            amount: numericAmount, 
            date, 
            type, 
            category 
        });
    };

    const incomeCategories = [TransactionCategory.Salary, TransactionCategory.Freelance, TransactionCategory.Other];
    const expenseCategories = Object.values(TransactionCategory).filter(c => !incomeCategories.includes(c) || c === TransactionCategory.Other);

    const availableCategories = type === TransactionType.Income ? incomeCategories : expenseCategories;
    
    useEffect(() => {
        // If the current category is not available for the selected type, reset it
        if (!availableCategories.includes(category)) {
            setCategory(availableCategories[0]);
        }
    }, [type, category, availableCategories]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 w-full input-field" />
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 w-full input-field" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full input-field" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as TransactionType)} className="mt-1 w-full input-field">
                                {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                         <select id="category" value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} className="mt-1 w-full input-field">
                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Save Transaction
                    </button>
                </div>
            </form>
            <style>{`.input-field { display: block; px: 3; py: 2; border: 1px solid; border-color: #d1d5db; background-color: #f9fafb; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input-field { border-color: #4b5563; background-color: #374151; } .input-field:focus { outline: none; --tw-ring-color: hsl(220, 80%, 55%); border-color: hsl(220, 80%, 55%); box-shadow: 0 0 0 1px hsl(220, 80%, 55%); }`}</style>
        </Modal>
    );
};

export default AddEditTransactionModal;