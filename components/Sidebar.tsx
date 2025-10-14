import React, { useState } from 'react';
import { View } from '../types';
import { User } from '../contexts/UserContext';
import { DashboardIcon, TransactionsIcon, InsightsIcon, SettingsIcon, LogoutIcon, LogoIcon, MenuIcon, CloseIcon, ProfileIcon } from './icons/Icons';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    onLogout: () => void;
    currentUser: User;
}

const navItems = [
    { view: View.Dashboard, icon: DashboardIcon, label: 'Dashboard' },
    { view: View.Transactions, icon: TransactionsIcon, label: 'Transactions' },
    { view: View.Insights, icon: InsightsIcon, label: 'Insights' },
    { view: View.Settings, icon: SettingsIcon, label: 'Settings' },
    { view: View.Profile, icon: ProfileIcon, label: 'Profile' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, currentUser }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavLink: React.FC<{ view: View; icon: React.ElementType; label: string }> = ({ view, icon: Icon, label }) => (
        <button
            onClick={() => {
                setActiveView(view);
                setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    const sidebarContent = (
        <div className="flex flex-col h-full p-4">
            <div className="flex items-center space-x-3 mb-8 px-2">
                <LogoIcon className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">SmartMoney</span>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavLink key={item.view} {...item} />)}
            </nav>
            <div className="mt-auto">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-30 flex justify-between items-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <LogoIcon className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">SmartMoney</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    {isMobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
            </header>
            
            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                 <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-shrink-0 w-64">
                <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    {sidebarContent}
                </div>
            </aside>
        </>
    );
};