import React, { useEffect } from 'react';
import { CloseIcon } from '../icons/Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-75 z-50 flex items-center justify-center p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="fixed inset-0" 
                aria-hidden="true" 
                onClick={onClose}
            ></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-auto animate-fade-in-scale">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;