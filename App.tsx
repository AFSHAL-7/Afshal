import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { UserProvider, useUser } from './contexts/UserContext';
import { View, Transaction, Account, Budget, TransactionCategory, Profile as ProfileData } from './types';
import { SmartMoneyDB, getDbForUser, fromDBAccount, toDBAccount } from './services/db';
import { SpinnerIcon, LogoIcon, MenuIcon, CloseIcon, LogoutIcon } from './components/icons/Icons';
import OfflineIndicator from './components/ui/OfflineIndicator';
import ConfirmModal from './components/modals/ConfirmModal';


const AppContent: React.FC = () => {
    const { currentUser, login, register, logout, updateUser } = useUser();
    const [userDb, setUserDb] = useState<SmartMoneyDB | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [activeView, setActiveView] = useState<View>(View.Dashboard);
    
    // State Management
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budget, setBudget] = useState<Budget>({});
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [chartFilter, setChartFilter] = useState<{ type: 'date' | 'category' | null, value: string | null }>({ type: null, value: null });
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!userDb || !currentUser) return;
        
        setIsConnecting(true);
        const [dbTransactions, dbAccounts, dbBudgetItems, dbProfile] = await Promise.all([
            userDb.transactions.toArray(),
            userDb.accounts.toArray(),
            userDb.budget.toArray(),
            userDb.profiles.get(currentUser.username)
        ]);
        
        setTransactions(dbTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAccounts(dbAccounts.map(fromDBAccount));
        setProfile(dbProfile || null);

        const budgetObject = dbBudgetItems.reduce((acc, item) => {
            acc[item.category] = item.amount;
            return acc;
        }, {} as Budget);
        setBudget(budgetObject);
        setIsConnecting(false);
    }, [userDb, currentUser]);

    // Effect to initialize DB connection when user logs in
    useEffect(() => {
        const connectToDb = async () => {
            if (currentUser) {
                setIsConnecting(true);
                const db = getDbForUser(currentUser.username);
                // Dexie's lazy-opening means we don't strictly need db.open(),
                // but it can be useful for explicitly catching connection errors early.
                await db.open();
                setUserDb(db);
            } else {
                setUserDb(null);
                setIsConnecting(false);
            }
        };
        connectToDb();
    }, [currentUser]);

    // Effect to fetch data when DB connection is established
    useEffect(() => {
        if (userDb) {
            fetchData();
        } else {
            // Clear data on logout
            setTransactions([]);
            setAccounts([]);
            setBudget({});
            setProfile(null);
        }
    }, [userDb, fetchData]);

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const handleUpdateProfile = useCallback(async (newUsername: string, profileDetails: Omit<ProfileData, 'username'>) => {
        if (!currentUser || !userDb) {
            throw new Error("No user is logged in or database is not connected.");
        }
    
        const currentUsername = currentUser.username;
    
        // 1. Save non-username profile details to the current database.
        const profileData: ProfileData = {
            username: currentUsername,
            ...profileDetails,
        };
        await userDb.profiles.put(profileData);
        setProfile(profileData);
    
        // 2. If the username has changed, call the context's updateUser function.
        // This will handle renaming the database and all its data, then reload the app.
        const trimmedNewUsername = newUsername.trim();
        if (trimmedNewUsername !== currentUsername) {
            try {
                await updateUser(trimmedNewUsername);
                // updateUser will cause a page reload, so no further action is needed here.
            } catch (error) {
                // If the username update fails, re-throw the error so the UI can catch it.
                console.error("Username update failed:", error);
                throw error;
            }
        }
    }, [currentUser, userDb, updateUser]);

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

    const handleSaveTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'source'>) => {
        if (!userDb) return;
        if (editingTransaction) {
            // Edit existing transaction
            const updatedTransaction = { ...editingTransaction, ...transaction };
            await userDb.transactions.put(updatedTransaction);
        } else {
            // Add new transaction
            const newTransaction: Transaction = {
                ...transaction,
                id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                source: 'Manual',
            };
            await userDb.transactions.add(newTransaction);
        }
        await fetchData();
        handleCloseModal();
    }, [userDb, editingTransaction, handleCloseModal, fetchData]);
    
    const handleAddTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'source'>) => {
        if (!userDb) return;
        const newTransaction: Transaction = {
            ...transaction,
            id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            source: 'Manual',
        };
        await userDb.transactions.add(newTransaction);
        await fetchData();
    }, [userDb, fetchData]);

    const handleDeleteTransaction = useCallback(async (transactionId: string) => {
        if (!userDb) return;
        await userDb.transactions.delete(transactionId);
        await fetchData();
    }, [userDb, fetchData]);

    const handleBulkDeleteTransactions = useCallback(async (transactionIds: string[]) => {
        if (!userDb) return;
        await userDb.transactions.bulkDelete(transactionIds);
        await fetchData();
    }, [userDb, fetchData]);

    const handleBulkCategorizeTransactions = useCallback(async (transactionIds: string[], category: TransactionCategory) => {
        if (!userDb) return;
        const transactionsToUpdate = await userDb.transactions.where('id').anyOf(transactionIds).toArray();
        const updatedTransactions = transactionsToUpdate.map(t => ({ ...t, category }));
        await userDb.transactions.bulkPut(updatedTransactions);
        await fetchData();
    }, [userDb, fetchData]);

    const handleLinkAccount = useCallback(async (account: Account) => {
        if (!userDb) return;
        await userDb.accounts.add(toDBAccount(account));
        await fetchData();
    }, [userDb, fetchData]);

    const handleUnlinkAccount = useCallback(async (accountId: string) => {
        if (!userDb) return;
        await userDb.accounts.delete(accountId);
        await fetchData();
    }, [userDb, fetchData]);

    const handleSetChartFilter = useCallback((type: 'date' | 'category', value: string) => {
        setChartFilter({ type, value });
        setActiveView(View.Transactions);
    }, []);

    const handleClearChartFilter = useCallback(() => {
        setChartFilter({ type: null, value: null });
    }, []);



    const handleSetBudget = useCallback(async (category: TransactionCategory, amount: number) => {
        if (!userDb) return;
        await userDb.budget.put({ category, amount });
        await fetchData();
    }, [userDb, fetchData]);


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
                return <Profile currentUser={currentUser!} profile={profile} transactionsCount={transactions.length} onUpdateProfile={handleUpdateProfile} />;
            default:
                return <Dashboard {...dashboardProps} />;
        }
    }, [activeView, transactions, accounts, budget, currentUser, profile, handleUpdateProfile, handleDeleteTransaction, handleLinkAccount, handleUnlinkAccount, handleSetChartFilter, chartFilter, handleClearChartFilter, handleAddTransaction, handleSetBudget, handleBulkDeleteTransactions, handleBulkCategorizeTransactions, handleOpenAddModal, handleOpenEditModal]);

    if (!currentUser) {
        return <Login onLogin={login} onRegister={register} />;
    }

    if (isConnecting) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <SpinnerIcon className="h-12 w-12 text-primary" />
            </div>
        );
    }

    return (
        <ThemeProvider>
            <CurrencyProvider>
                <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
                     {/* Mobile Header */}
                    <header className="lg:hidden flex-shrink-0 flex justify-between items-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <LogoIcon className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold text-gray-800 dark:text-white">SmartMoney</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {isMobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        <Sidebar 
                            activeView={activeView} 
                            setActiveView={setActiveView} 
                            onLogout={handleLogout} 
                            currentUser={currentUser}
                            isMobileMenuOpen={isMobileMenuOpen}
                            setIsMobileMenuOpen={setIsMobileMenuOpen} 
                        />
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
                            {mainContent}
                        </main>
                    </div>

                    <AddEditTransactionModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveTransaction}
                        transaction={editingTransaction}
                    />
                    <ConfirmModal
                        isOpen={isLogoutConfirmOpen}
                        onClose={() => setIsLogoutConfirmOpen(false)}
                        onConfirm={logout}
                        title="Confirm Logout"
                        message="Are you sure you want to log out of your account?"
                        confirmText="Logout"
                        ConfirmIcon={LogoutIcon}
                        confirmButtonClass="bg-primary hover:bg-primary-700 focus:ring-primary"
                    />
                    {isOffline && <OfflineIndicator />}
                </div>
            </CurrencyProvider>
        </ThemeProvider>
    );
};

const App: React.FC = () => (
    <UserProvider>
        <AppContent />
    </UserProvider>
);

export default App;