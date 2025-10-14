import React from 'react';
import Modal from '../ui/Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    confirmButtonClass?: string;
    ConfirmIcon?: React.ElementType;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Confirm',
    confirmButtonClass = 'bg-primary hover:bg-primary-700 focus:ring-primary',
    ConfirmIcon
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
                >
                    {ConfirmIcon && <ConfirmIcon className="h-4 w-4" />}
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;