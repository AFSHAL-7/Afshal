import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, TransactionCategory, TransactionType } from '../types';
import { SearchIcon, CloseIcon, PlusIcon, SpinnerIcon, EditIcon, DeleteIcon, TagIcon, ChevronDownIcon, FilterIcon } from './icons/Icons';
import FloatingActionButton from './ui/FloatingActionButton';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCategoryIcon, getCategoryBadgeStyle } from '../../utils/getCategoryIcon';
import ConfirmModal from './modals/ConfirmModal';
import Modal from './ui/Modal';

interface TransactionsProps {
    transactions: Transaction[];
    onAddTransaction: () => void;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (id: string) => void;
    onBulkDeleteTransactions: (ids: string[]) => void;
    onBulkCategorizeTransactions: (ids: string[], category: TransactionCategory) => void;
    chartFilter: { type: 'date' | 'category' | null, value: string | null };
    onClearChartFilter: () => void;
    onSaveNewTransaction: (transaction: Omit<Transaction, 'id' | 'source' | 'notes' | 'tags'>) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, onBulkDeleteTransactions, onBulkCategorizeTransactions, chartFilter, onClearChartFilter, onSaveNewTransaction }) => {
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [sortOrder, setSortOrder] = useState<string>('date-desc');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    const [deletionTarget, setDeletionTarget] = useState<string | string[] | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.Food);

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setType(TransactionType.Expense);
        setCategory(TransactionCategory.Food);
    };

    const handleCancelAdd = () => {
        setIsAddFormVisible(false);
        resetForm();
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please provide a valid description and a positive amount.');
            return;
        }

        onSaveNewTransaction({ 
            description: description.trim(), 
            amount: numericAmount, 
            date, 
            type, 
            category 
        });

        setIsAddFormVisible(false);
        resetForm();
    };

    const incomeCategories = [TransactionCategory.Salary, TransactionCategory.Freelance, TransactionCategory.Other];
    const expenseCategories = Object.values(TransactionCategory).filter(c => !incomeCategories.includes(c) || c === TransactionCategory.Other);
    const availableCategories = type === TransactionType.Income ? incomeCategories : expenseCategories;
    
    useEffect(() => {
        if (!availableCategories.includes(category)) {
            setCategory(availableCategories[0]);
        }
    }, [type, category, availableCategories]);


    const processedTransactions = useMemo(() => {
        const filtered = transactions.filter(t => {
            const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = filterType === 'All' || t.type === filterType;
            const categoryMatch = filterCategory === 'All' || t.category === filterCategory;
            
            const chartFilterMatch = () => {
                if (!chartFilter.type || !chartFilter.value) return true;
                if (chartFilter.type === 'date') {
                    // Match the date part of the ISO string
                    return t.date.startsWith(chartFilter.value);
                }
                if (chartFilter.type === 'category') {
                    return t.category === chartFilter.value;
                }
                return true;
            };

            return searchMatch && typeMatch && categoryMatch && chartFilterMatch();
        });

        // Apply sorting
        return filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'date-desc':
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
    }, [transactions, searchTerm, filterType, filterCategory, chartFilter, sortOrder]);

    const summary = useMemo(() => {
        return processedTransactions.reduce((acc, t) => {
            if (t.type === TransactionType.Income) {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [processedTransactions]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading
        return () => clearTimeout(timer);
    }, [searchTerm, filterType, filterCategory, chartFilter, sortOrder]);
    
    // Clear selection when filters change
    useEffect(() => {
        setSelectedIds([]);
    }, [searchTerm, filterType, filterCategory, sortOrder, chartFilter]);

    // Handle indeterminate state of select all checkbox
    const areAllSelected = processedTransactions.length > 0 && selectedIds.length === processedTransactions.length;
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = selectedIds.length > 0 && selectedIds.length < processedTransactions.length;
        }
    }, [selectedIds, processedTransactions.length]);

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAll = () => {
        if (areAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(processedTransactions.map(t => t.id));
        }
    };
    
    const handleBulkDelete = () => {
        setDeletionTarget(selectedIds);
    };
    
    const handleBulkCategorize = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value as TransactionCategory;
        if (newCategory) {
            onBulkCategorizeTransactions(selectedIds, newCategory);
            setSelectedIds([]);
            e.target.value = ""; // Reset dropdown
        }
    };
    
    const handleConfirmDelete = () => {
        if (Array.isArray(deletionTarget)) {
            onBulkDeleteTransactions(deletionTarget);
            setSelectedIds([]);
        } else if (deletionTarget) {
            onDeleteTransaction(deletionTarget);
        }
        setDeletionTarget(null);
    };

    const handleToggleExpand = (id: string) => {
        if (selectedIds.length > 0) return;
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    const filterControls = (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary py-2 px-3"
            >
                <option value="All">All Types</option>
                {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary py-2 px-3"
            >
                <option value="All">All Categories</option>
                {Object.values(TransactionCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary py-2 px-3"
            >
                <option value="date-desc">Sort: Date (Newest)</option>
                <option value="date-asc">Sort: Date (Oldest)</option>
                <option value="amount-desc">Sort: Amount (Highest)</option>
                <option value="amount-asc">Sort: Amount (Lowest)</option>
            </select>
        </div>
    );


    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                <div className="relative flex-grow md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div className="hidden md:flex">{filterControls}</div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="md:hidden w-full flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        <FilterIcon className="h-4 w-4" />
                        Filters
                    </button>
                    {!isAddFormVisible && (
                        <button
                            onClick={() => setIsAddFormVisible(true)}
                            className="w-full flex-1 md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add 
                        </button>
                    )}
                </div>
            </div>
            
            {isAddFormVisible && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Transaction</h3>
                    <form onSubmit={handleSave}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 w-full input-field" />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 w-full input-field" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select id="category" value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} className="mt-1 w-full input-field">
                                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={handleCancelAdd} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Save Transaction
                            </button>
                        </div>
                    </form>
                    <style>{`.input-field { display: block; width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid #d1d5db; background-color: #f9fafb; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input-field { border-color: #4b5563; background-color: #374151; } .input-field:focus { outline: none; --tw-ring-color: hsl(220, 80%, 55%); border-color: hsl(220, 80%, 55%); box-shadow: 0 0 0 1px hsl(220, 80%, 55%); }`}</style>
                </div>
            )}

            {chartFilter.type && chartFilter.value && (
                <div className="bg-primary-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between text-sm text-primary-700 dark:text-primary-200">
                    <p>
                        <span className="font-semibold">Filtered by chart:</span>{' '}
                        {chartFilter.type === 'category'
                            ? `Category is "${chartFilter.value}"`
                            : `Date is "${new Date(chartFilter.value).toLocaleDateString()}"`}
                    </p>
                    <button
                        onClick={onClearChartFilter}
                        className="flex items-center gap-1 font-semibold hover:text-primary-500 dark:hover:text-primary-100 transition-colors"
                        aria-label="Clear chart filter"
                    >
                        <CloseIcon className="h-4 w-4" />
                        Clear
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Transaction History</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <SpinnerIcon className="h-10 w-10 text-primary" />
                    </div>
                ) : processedTransactions.length > 0 ? (
                    <>
                        <div className="hidden md:grid md:grid-cols-12 gap-4 items-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <div className="col-span-1 flex items-center pl-2">
                                <input
                                    type="checkbox"
                                    ref={selectAllCheckboxRef}
                                    checked={areAllSelected}
                                    onChange={handleToggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    aria-label="Select all transactions"
                                />
                            </div>
                            <div className="col-span-3">Description</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2 text-center">Date</div>
                            <div className="col-span-1 text-center">Source</div>
                            <div className="col-span-2 text-right">Amount</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {processedTransactions.map(transaction => {
                                const { description, category, date, amount, type, source } = transaction;
                                const Icon = getCategoryIcon(category);
                                const amountColor = type === TransactionType.Income ? 'text-green-500' : 'text-red-500';
                                const amountSign = type === TransactionType.Income ? '+' : '-';
                                const sourceColor = source === 'UPI' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
                                const isSelected = selectedIds.includes(transaction.id);
                                const isExpanded = expandedId === transaction.id;

                                return (
                                <div key={transaction.id} className={`rounded-lg transition-colors duration-200 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/50' : ''} ${isExpanded && !isSelected ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                                    <div 
                                        className={`py-3 px-2 ${!isSelected && !isExpanded ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg' : ''} ${selectedIds.length === 0 ? 'cursor-pointer' : 'cursor-default'}`}
                                        onClick={() => handleToggleExpand(transaction.id)}
                                        role="button"
                                        aria-expanded={isExpanded}
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(transaction.id); }}
                                    >
                                        {/* Mobile View */}
                                        <div className="md:hidden">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelect(transaction.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                                                        <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white">{description}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                                            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                            <span>&middot;</span>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryBadgeStyle(category)}`}>{category}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-lg text-right ${amountColor}`}>
                                                        {amountSign} {formatCurrency(amount)}
                                                    </p>
                                                    {selectedIds.length === 0 && <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center pl-12">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceColor}`}>{source}</span>
                                                {selectedIds.length === 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); onEditTransaction(transaction); }} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label={`Edit ${description}`}>
                                                            <EditIcon className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeletionTarget(transaction.id); }} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400" aria-label={`Delete ${description}`}>
                                                            <DeleteIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop View */}
                                        <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                                            <div className="col-span-1 flex items-center justify-start pl-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(transaction.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </div>
                                            <div className="col-span-3 flex items-center gap-3">
                                                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <p className="font-semibold text-gray-800 dark:text-white truncate">{description}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeStyle(category)}`}>
                                                    {category}
                                                </span>
                                            </div>
                                            <p className="col-span-2 text-center text-gray-500 dark:text-gray-400">
                                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year:'2-digit' })}
                                            </p>
                                            <div className="col-span-1 text-center">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceColor}`}>{source}</span>
                                            </div>
                                            <p className={`col-span-2 text-right font-bold ${amountColor}`}>
                                                {amountSign} {formatCurrency(amount)}
                                            </p>
                                            <div className="col-span-1 flex items-center justify-end">
                                                {selectedIds.length === 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); onEditTransaction(transaction); }} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" aria-label={`Edit ${description}`}>
                                                            <EditIcon className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeletionTarget(transaction.id); }} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-red-500 dark:text-red-400" aria-label={`Delete ${description}`}>
                                                            <DeleteIcon className="h-4 w-4" />
                                                        </button>
                                                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="px-6 pb-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-2">
                                                <div>
                                                    <p className="font-semibold text-gray-500 dark:text-gray-400">Transaction ID</p>
                                                    <p className="text-gray-700 dark:text-gray-300 font-mono text-xs">{transaction.id}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-500 dark:text-gray-400">Full Date</p>
                                                    <p className="text-gray-700 dark:text-gray-300">{new Date(transaction.date).toLocaleString()}</p>
                                                </div>
                                                {transaction.notes && (
                                                    <div className="md:col-span-2">
                                                        <p className="font-semibold text-gray-500 dark:text-gray-400">Notes</p>
                                                        <p className="text-gray-700 dark:text-gray-300 italic">{transaction.notes}</p>
                                                    </div>
                                                )}
                                                {transaction.tags && transaction.tags.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Tags</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {transaction.tags.map(tag => (
                                                                <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                )
                            })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-6 text-right">
                             <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income (Filtered)</p>
                                <p className="font-semibold text-lg text-green-500">
                                    {formatCurrency(summary.income)}
                                </p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense (Filtered)</p>
                                <p className="font-semibold text-lg text-red-500">
                                    {formatCurrency(summary.expense)}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions found.</p>
                )}
            </div>
            {selectedIds.length === 0 && <FloatingActionButton onClick={onAddTransaction} />}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-20 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold text-gray-800 dark:text-white">{selectedIds.length}</span>
                                <span className="text-gray-600 dark:text-gray-300">selected</span>
                            </div>
                             <div className="flex items-center gap-3">
                                 <div className="relative">
                                    <select
                                        onChange={handleBulkCategorize}
                                        value=""
                                        className="appearance-none w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary py-2 pl-3 pr-8"
                                        aria-label="Change category for selected transactions"
                                    >
                                        <option value="" disabled>Change Category...</option>
                                        {Object.values(TransactionCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                        <TagIcon className="h-4 w-4" />
                                    </div>
                                 </div>
                                <button
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <DeleteIcon className="h-4 w-4" />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                                    aria-label="Cancel selection"
                                >
                                    <CloseIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmModal
                isOpen={deletionTarget !== null}
                onClose={() => setDeletionTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={
                    Array.isArray(deletionTarget)
                        ? `Are you sure you want to delete ${deletionTarget.length} selected transaction(s)? This action cannot be undone.`
                        : "Are you sure you want to delete this transaction? This action cannot be undone."
                }
                confirmText="Delete"
                ConfirmIcon={DeleteIcon}
                confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            />
            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Transactions">
                <div className="p-6 space-y-4">
                    {filterControls}
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Done
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Transactions;