import React, { useState, useCallback } from 'react';
import { Transaction } from '../types';
import { generateFinancialInsight } from '../services/geminiService';
import { SparklesIcon, AiIcon, SpinnerIcon } from './icons/Icons';

interface InsightsProps {
    transactions: Transaction[];
}

const Insights: React.FC<InsightsProps> = ({ transactions }) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setInsight('');
        try {
            const result = await generateFinancialInsight(transactions);
            setInsight(result);
        } catch (e) {
            setError('Failed to generate insight. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [transactions]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                         <SparklesIcon className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Get AI-Powered Financial Insights</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                    Let our smart assistant analyze your recent financial activity and provide you with personalized insights to help you manage your money better.
                </p>
                <button
                    onClick={handleGenerateInsight}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="-ml-1 mr-3 h-5 w-5 text-white" />
                            Generating...
                        </>
                    ) : (
                        <>
                           <AiIcon className="h-5 w-5 mr-2"/>
                           Generate Insight
                        </>
                    )}
                </button>
            </div>

            {(insight || error) && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Insight</h3>
                    {error && <p className="text-red-500">{error}</p>}
                    {insight && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{insight}</p>}
                 </div>
            )}
        </div>
    );
};

export default Insights;
