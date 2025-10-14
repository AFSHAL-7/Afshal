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
import { supabase, isSupabaseConfigured } from './services/supabase';
import { SpinnerIcon, LogoIcon, MenuIcon, CloseIcon, LogoutIcon, GooglePayIcon, PhonePeIcon, BankIcon, WarningIcon } from './components/icons/Icons';
import OfflineIndicator from './components/ui/OfflineIndicator';
import ConfirmModal from './components/modals/ConfirmModal';


// Helper to get the actual icon component from its string name
const getAccountIconComponent = (iconName: string): React.ElementType => {
    switch(iconName) {
        case 'GooglePayIcon': return GooglePayIcon;
        case 'PhonePeIcon': return PhonePeIcon;
        case 'BankIcon': return BankIcon;
        default: return BankIcon;
    }
};

// Convert a DB account record into an Account object usable by the UI
const fromDBAccount = (dbAccount: Omit<Account, 'icon'> & { icon: string }): Account => ({
    ...dbAccount,
    icon: getAccountIconComponent(dbAccount.icon),
});

// Convert a UI Account object into a record for DB storage
const toDBAccount = (account: Account): Omit<Account, 'icon'> & { icon: string } => {
    let iconName = 'BankIcon';
    if (account.icon === GooglePayIcon) iconName = 'GooglePayIcon';
    else if (account.icon === PhonePeIcon) iconName = 'PhonePeIcon';
    
    return { ...account, icon: iconName };
};


const AppContent: React.FC = () => {
    if (!isSupabaseConfigured) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
                <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/50">
                        <WarningIcon className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-2xl font-bold text-red-500 dark:text-red-400">Configuration Error</h1>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                        The application is not connected to a backend database.
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Please provide your Supabase URL and anonymous key as environment variables (<code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>) to enable database functionality.
                    </p>
                </div>
            </div>
        );
    }

    const { user, profile, loading: userLoading, login, register, logout, refetchProfile } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [activeView, setActiveView] = useState<View>(View.Dashboard);
    
    // State Management
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budget, setBudget] = useState<Budget>({});
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
        if (!user || !supabase) return;
        
        setIsLoading(true);
        const { data: transactionsData, error: transactionsError } = await supabase.from('transactions').select('*').eq('user_id', user.id);
        const { data: accountsData, error: accountsError } = await supabase.from('accounts').select('*').eq('user_id', user.id);
        const { data: budgetData, error: budgetError } = await supabase.from('budget').select('*').eq('user_id', user.id);

        if (transactionsError || accountsError || budgetError) {
            console.error("Error fetching data:", transactionsError || accountsError || budgetError);
            setIsLoading(false);
            return;
        }
        
        setTransactions(transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAccounts(accountsData.map(fromDBAccount));

        const budgetObject = budgetData.reduce((acc, item) => {
            acc[item.category] = item.amount;
            return acc;
        }, {} as Budget);
        setBudget(budgetObject);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        } else if (!userLoading) {
            // Clear data on logout or if no user is found
            setTransactions([]);
            setAccounts([]);
            setBudget({});
            setIsLoading(false);
        }
    }, [user, userLoading, fetchData]);

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };
    
    const handleUpdateProfile = async (newUsername: string, profileDetails: Omit<ProfileData, 'username' | 'id'>) => {
        if (!user || !supabase) throw new Error("No user is logged in.");

        const trimmedUsername = newUsername.trim();
        
        if (trimmedUsername !== profile?.username) {
            const { data: existingProfile, error: checkError } = await supabase.from('profiles').select('id').eq('username', trimmedUsername).limit(1).single();
            
            // A "no rows found" error is expected if the username is available.
            // We only need to throw if another, unexpected error occurs.
            if (checkError && checkError.code !== 'PGRST116') { 
                console.error("Error checking username:", checkError);
                throw checkError;
            }

            if (existingProfile && existingProfile.id !== user.id) {
                throw new Error('Username is already taken.');
            }
        }
        
        // For an update, we don't include the primary key in the payload.
        // We identify the row to update using `.eq()` instead.
        const profileDataToUpdate = {
            username: trimmedUsername,
            full_name: profileDetails.fullName,
            bio: profileDetails.bio,
            avatar: profileDetails.avatar,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .update(profileDataToUpdate)
            .eq('id', user.id);

        if (error) {
            console.error("Profile update failed:", error);
            throw error;
        }
        
        await refetchProfile();
    };

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
        if (!user || !supabase) return;
        if (editingTransaction) {
            const { error } = await supabase.from('transactions').update({ ...transaction }).eq('id', editingTransaction.id);
            if (error) console.error("Error updating transaction:", error);
        } else {
            const newTransaction = {
                ...transaction,
                user_id: user.id,
                source: 'Manual',
            };
            const { error } = await supabase.from('transactions').insert(newTransaction);
            if (error) console.error("Error adding transaction:", error);
        }
        await fetchData();
        handleCloseModal();
    }, [user, editingTransaction, handleCloseModal, fetchData]);
    
    const handleAddTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'source'>) => {
        if (!user || !supabase) return;
        const newTransaction = {
            ...transaction,
            user_id: user.id,
            source: 'Manual',
        };
        const { error } = await supabase.from('transactions').insert(newTransaction);
        if (error) console.error("Error adding transaction:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleDeleteTransaction = useCallback(async (transactionId: string) => {
        if (!user || !supabase) return;
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (error) console.error("Error deleting transaction:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleBulkDeleteTransactions = useCallback(async (transactionIds: string[]) => {
        if (!user || !supabase) return;
        const { error } = await supabase.from('transactions').delete().in('id', transactionIds);
        if (error) console.error("Error bulk deleting transactions:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleBulkCategorizeTransactions = useCallback(async (transactionIds: string[], category: TransactionCategory) => {
        if (!user || !supabase) return;
        const { error } = await supabase.from('transactions').update({ category }).in('id', transactionIds);
        if (error) console.error("Error bulk categorizing transactions:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleLinkAccount = useCallback(async (account: Account) => {
        if (!user || !supabase) return;
        const dbAccount = toDBAccount(account);
        const { error } = await supabase.from('accounts').insert({ ...dbAccount, user_id: user.id, id: undefined });
        if (error) console.error("Error linking account:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleUnlinkAccount = useCallback(async (accountId: string) => {
        if (!user || !supabase) return;
        const { error } = await supabase.from('accounts').delete().eq('id', accountId);
        if (error) console.error("Error unlinking account:", error);
        await fetchData();
    }, [user, fetchData]);

    const handleSetChartFilter = useCallback((type: 'date' | 'category', value: string) => {
        setChartFilter({ type, value });
        setActiveView(View.Transactions);
    }, []);

    const handleClearChartFilter = useCallback(() => {
        setChartFilter({ type: null, value: null });
    }, []);



    const handleSetBudget = useCallback(async (category: TransactionCategory, amount: number) => {
        if (!user || !supabase) return;
        const { error } = await supabase.from('budget').upsert({ user_id: user.id, category, amount }, { onConflict: 'user_id,category' });
        if (error) console.error("Error setting budget:", error);
        await fetchData();
    }, [user, fetchData]);


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
                return <Settings 
                           linkedAccounts={accounts} 
                           onLinkAccount={handleLinkAccount} 
                           onUnlinkAccount={handleUnlinkAccount}
                           onDataRefresh={fetchData} 
                       />;
            case View.Profile:
                return <Profile user={user!} profile={profile} transactionsCount={transactions.length} onUpdateProfile={handleUpdateProfile} />;
            default:
                return <Dashboard {...dashboardProps} />;
        }
    }, [activeView, transactions, accounts, budget, user, profile, handleDeleteTransaction, handleLinkAccount, handleUnlinkAccount, handleSetChartFilter, chartFilter, handleClearChartFilter, handleAddTransaction, handleSetBudget, handleBulkDeleteTransactions, handleBulkCategorizeTransactions, handleOpenAddModal, handleOpenEditModal, fetchData]);

    if (userLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <SpinnerIcon className="h-12 w-12 text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Login onLogin={login} onRegister={register} />;
    }

    if (isLoading) {
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
                            username={profile?.username || user.email!}
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