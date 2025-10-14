import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateFinancialInsight = async (transactions: Transaction[]): Promise<string> => {
    if (!navigator.onLine) {
        return "You are currently offline. Please connect to the internet to generate AI insights.";
    }

    if (!process.env.API_KEY) {
        return "API Key not configured. Please set up your environment variables.";
    }

    // Take the last 30 days of transactions for analysis
    const recentTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return transactionDate > thirtyDaysAgo;
    });

    if (recentTransactions.length < 5) {
        return "Not enough recent transaction data to generate an insight. Please check back later.";
    }

    const formattedTransactions = recentTransactions.map(t => 
        `${t.date.split('T')[0]}: ${t.type} of $${t.amount.toFixed(2)} for ${t.description} (Category: ${t.category})`
    ).join('\n');

    const totalIncome = recentTransactions.filter(t => t.type === TransactionType.Income).reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = recentTransactions.filter(t => t.type === TransactionType.Expense).reduce((acc, t) => acc + t.amount, 0);

    const prompt = `
        You are a financial analyst AI for an app called SmartMoney.
        Your task is to provide a short, insightful, and encouraging financial summary based on the user's recent transactions.
        The user's total income in the last 30 days was $${totalIncome.toFixed(2)} and total expenses were $${totalExpense.toFixed(2)}.

        Here are the user's transactions from the last 30 days:
        ${formattedTransactions}

        Based on this data, provide one or two interesting observations. For example, you can point out the category with the highest spending, compare income vs. expenses, or notice a trend. Keep the insight concise (2-3 sentences) and use a friendly tone. Do not use markdown formatting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 150,
                // FIX: Added `thinkingConfig` as required for the 'gemini-2.5-flash' model when `maxOutputTokens` is set.
                // This prevents all tokens from being consumed by "thinking", ensuring there is a budget for the final response.
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating insight from Gemini:", error);
        return "Sorry, I couldn't generate an insight at this moment. Please try again later.";
    }
};
