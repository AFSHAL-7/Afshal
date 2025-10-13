import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';

// Placeholder exchange rates relative to USD
const conversionRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.92,
    INR: 83.3,
    JPY: 157.0,
};

export const supportedCurrencies = Object.keys(conversionRates);

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<string>('USD');

    const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
        const rate = conversionRates[currency] || 1;
        const convertedAmount = amount * rate;
        
        const defaultOptions: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency,
        };
        
        try {
            return new Intl.NumberFormat(undefined, { ...defaultOptions, ...options }).format(convertedAmount);
        } catch (error) {
            console.warn(`Currency formatting failed for ${currency}, falling back to USD.`, error);
            // Fallback for unsupported currencies if any
            return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options, currency: 'USD' }).format(amount);
        }
    };

    const value = useMemo(() => ({
        currency,
        setCurrency,
        formatCurrency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [currency]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
