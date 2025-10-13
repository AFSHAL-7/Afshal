import React, { useState, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Insights from './components/Insights';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Login from './components/Login';
import AddEditTransactionModal from './components/modals/AddEditTransactionModal';
import { ThemeProvider } from './components/ThemeProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { View, Transaction, Account, Budget, TransactionCategory } from './types';
import { mockTransactions, mockAccounts, mockBudget } from './constants';
import { useMockRealTimeData } from './hooks/useMockRealTimeData';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeView, setActiveView] = useState<View>(View.Dashboard);
    
    // State Management
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budget, setBudget] = useState<Budget>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [chartFilter, setChartFilter] = useState<{ type: 'date' | 'category' | null, value: string | null }>({ type: null, value: null });

    const handleLogin = () => {
        setTransactions(mockTransactions);
        setAccounts(mockAccounts);
        setBudget(mockBudget);
        setIsAuthenticated(true);
    };

    useMockRealTimeData(isAuthenticated, setTransactions);

    const handleOpenAddModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    }, []);

    const handleSaveTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'source'>) => {
        if (editingTransaction) {
            // Edit existing transaction
            setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...editingTransaction, ...transaction } : t));
        } else {
            // Add new transaction
            const newTransaction: Transaction = {
                ...transaction,
                id: `manual-${Date.now()}`,
                source: 'Manual',
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
        handleCloseModal();
    }, [editingTransaction, handleCloseModal]);
    
    const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'source'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: `manual-${Date.now()}`,
            source: 'Manual',
        };
        setTransactions(prev => [newTransaction, ...prev]);
    }, []);

    const handleDeleteTransaction = useCallback((transactionId: string) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }, []);

    const handleBulkDeleteTransactions = useCallback((transactionIds: string[]) => {
        setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
    }, []);

    const handleBulkCategorizeTransactions = useCallback((transactionIds: string[], category: TransactionCategory) => {
        setTransactions(prev => prev.map(t => transactionIds.includes(t.id) ? { ...t, category } : t));
    }, []);

    const handleLinkAccount = useCallback((account: Account) => {
        setAccounts(prev => [...prev, account]);
    }, []);

    const handleUnlinkAccount = useCallback((accountId: string) => {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    }, []);

    const handleSetChartFilter = useCallback((type: 'date' | 'category', value: string) => {
        setChartFilter({ type, value });
        setActiveView(View.Transactions);
    }, []);

    const handleClearChartFilter = useCallback(() => {
        setChartFilter({ type: null, value: null });
    }, []);

    const handleSetBudget = useCallback((category: TransactionCategory, amount: number) => {
        setBudget(prev => ({
            ...prev,
            [category]: amount,
        }));
    }, []);


    const mainContent = useMemo(() => {
        const transactionsProps = {
            transactions,
            onAddTransaction: handleOpenAddModal,
            onEditTransaction: handleOpenEditModal,
            onDeleteTransaction: handleDeleteTransaction,
            onBulkDeleteTransactions: handleBulkDeleteTransactions,
            onBulkCategorizeTransactions: handleBulkCategorizeTransactions,
            onSaveNewTransaction: handleAddTransaction,
        };
        const dashboardProps = {
            transactions,
            budget,
            onAddTransaction: handleOpenAddModal,
            onSetChartFilter: handleSetChartFilter,
            onSetBudget: handleSetBudget,
        };

        switch (activeView) {
            case View.Dashboard:
                return <Dashboard {...dashboardProps} />;
            case View.Transactions:
                return <Transactions {...transactionsProps} chartFilter={chartFilter} onClearChartFilter={handleClearChartFilter} />;
            case View.Insights:
                return <Insights transactions={transactions} />;
            case View.Settings:
                return <Settings linkedAccounts={accounts} onLinkAccount={handleLinkAccount} onUnlinkAccount={handleUnlinkAccount} />;
            case View.Profile:
                return <Profile transactionsCount={transactions.length} />;
            default:
                return <Dashboard {...dashboardProps} />;
        }
    }, [activeView, transactions, accounts, budget, handleDeleteTransaction, handleLinkAccount, handleUnlinkAccount, handleSetChartFilter, chartFilter, handleClearChartFilter, handleAddTransaction, handleSetBudget, handleBulkDeleteTransactions, handleBulkCategorizeTransactions]);

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <ThemeProvider>
            <CurrencyProvider>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={() => setIsAuthenticated(false)} />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
                        {mainContent}
                    </main>
                    <AddEditTransactionModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveTransaction}
                        transaction={editingTransaction}
                    />
                </div>
            </CurrencyProvider>
        </ThemeProvider>
    );
};

export default App;