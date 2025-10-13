import React, { useState } from 'react';
import { ThemeToggle } from './ui/ThemeToggle';
import { Account } from '../types';
import LinkAccountModal from './modals/LinkAccountModal';
import { PlusIcon } from './icons/Icons';
import { useCurrency, supportedCurrencies } from '../contexts/CurrencyContext';

interface AccountItemProps {
    account: Account;
    onUnlink: (id: string) => void;
}

const AccountItem: React.FC<AccountItemProps> = ({ account, onUnlink }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-4">
            <account.icon className="h-8 w-8" />
            <span className="font-medium text-gray-800 dark:text-gray-200">{account.name}</span>
        </div>
        <button onClick={() => onUnlink(account.id)} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">
            Unlink
        </button>
    </div>
);

interface SettingsProps {
    linkedAccounts: Account[];
    onLinkAccount: (account: Account) => void;
    onUnlinkAccount: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ linkedAccounts, onLinkAccount, onUnlinkAccount }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Preferences</h2>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex items-center justify-between py-4">
                        <span className="text-gray-600 dark:text-gray-300">Theme</span>
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <label htmlFor="currency-select" className="text-gray-600 dark:text-gray-300">Currency</label>
                        <select
                            id="currency-select"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary py-2 px-3"
                        >
                            {supportedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Linked Accounts</h2>
                    <button 
                        onClick={() => setIsLinkModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Link New Account
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Manage your connected UPI and bank accounts. Transactions will be synced automatically.
                </p>
                <div className="space-y-4">
                   {linkedAccounts.map(account => (
                       <AccountItem key={account.id} account={account} onUnlink={onUnlinkAccount} />
                   ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                 <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notifications</h2>
                 <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Email notifications for major transactions</p>
                     <label htmlFor="toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" id="toggle" className="sr-only peer" defaultChecked/>
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                 </div>
            </div>
            <LinkAccountModal 
                isOpen={isLinkModalOpen} 
                onClose={() => setIsLinkModalOpen(false)}
                onLink={onLinkAccount}
                existingAccounts={linkedAccounts}
            />
        </div>
    );
};

export default Settings;