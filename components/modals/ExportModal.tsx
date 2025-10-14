import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { ExportIcon } from '../icons/Icons';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (startDate: string, endDate: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!startDate || !endDate) {
            setError('Both start and end dates are required.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after the end date.');
            return;
        }
        setError('');
        onExport(startDate, endDate);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Transactions">
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a date range to export your transactions as a CSV file.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="mt-1 w-full input-field"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="mt-1 w-full input-field"
                        />
                    </div>
                </div>
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                 <style>{`.input-field { display: block; width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid #d1d5db; background-color: #f9fafb; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input-field { border-color: #4b5563; background-color: #374151; } .input-field:focus { outline: none; --tw-ring-color: hsl(220, 80%, 55%); border-color: hsl(220, 80%, 55%); box-shadow: 0 0 0 1px hsl(220, 80%, 55%); }`}</style>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <ExportIcon className="h-4 w-4" />
                    Export CSV
                </button>
            </div>
        </Modal>
    );
};

export default ExportModal;
