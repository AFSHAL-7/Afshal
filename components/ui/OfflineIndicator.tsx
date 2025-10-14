import React from 'react';
import { OfflineIcon } from '../icons/Icons';

const OfflineIndicator: React.FC = () => {
    return (
        <div 
            className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-lg shadow-lg dark:bg-gray-700 animate-fade-in-scale"
            role="status"
            aria-live="polite"
        >
            <OfflineIcon className="h-5 w-5" />
            <span className="text-sm font-medium">You are currently offline.</span>
        </div>
    );
};

export default OfflineIndicator;
