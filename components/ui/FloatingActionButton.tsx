import React from 'react';
import { PlusIcon } from '../icons/Icons';

interface FloatingActionButtonProps {
    onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-transform hover:scale-105"
            aria-label="Add new transaction"
        >
            <PlusIcon className="h-6 w-6" />
        </button>
    );
};

export default FloatingActionButton;
