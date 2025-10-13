import React from 'react';
import Modal from '../ui/Modal';
import { Account } from '../../types';
import { BankIcon, GooglePayIcon, PhonePeIcon } from '../icons/Icons';

interface LinkAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLink: (account: Account) => void;
    existingAccounts: Account[];
}

const allPossibleAccounts: Omit<Account, 'id'>[] = [
    { name: 'Google Pay', type: 'UPI', icon: GooglePayIcon },
    { name: 'PhonePe', type: 'UPI', icon: PhonePeIcon },
    { name: 'HDFC Bank', type: 'Bank', icon: BankIcon },
    { name: 'ICICI Bank', type: 'Bank', icon: BankIcon },
    { name: 'SBI Bank', type: 'Bank', icon: BankIcon },
];

const LinkAccountModal: React.FC<LinkAccountModalProps> = ({ isOpen, onClose, onLink, existingAccounts }) => {
    
    const availableAccounts = allPossibleAccounts.filter(
        pAcc => !existingAccounts.some(eAcc => eAcc.name === pAcc.name)
    );

    const handleLinkClick = (account: Omit<Account, 'id'>) => {
        // Simulate linking process
        const newAccount: Account = {
            ...account,
            id: `acc-${Date.now()}`
        };
        onLink(newAccount);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Link a New Account">
            <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select an account to link. You will be redirected to securely grant access.
                </p>
                <div className="space-y-3">
                    {availableAccounts.length > 0 ? availableAccounts.map(account => (
                        <button 
                            key={account.name}
                            onClick={() => handleLinkClick(account)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <account.icon className="h-7 w-7" />
                                <span className="font-medium text-gray-800 dark:text-gray-200">{account.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">Link</span>
                        </button>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">All available accounts have been linked.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default LinkAccountModal;
