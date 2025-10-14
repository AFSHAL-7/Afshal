import React, { createContext, useContext, useMemo, ReactNode } from 'react';

export const supportedCurrencies = ['INR'];

interface CurrencyContextType {
    currency: string;
    formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const currency = 'INR';

    const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
        const defaultOptions: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency,
        };
        
        try {
            // Using 'en-IN' locale for appropriate INR formatting (e.g., Lakh, Crore for large numbers)
            return new Intl.NumberFormat('en-IN', { ...defaultOptions, ...options }).format(amount);
        } catch (error) {
            console.warn(`Currency formatting failed for ${currency}, falling back to default.`, error);
            // Fallback for safety, though it shouldn't be needed for INR
            return new Intl.NumberFormat(undefined, { ...defaultOptions, ...options }).format(amount);
        }
    };

    const value = useMemo(() => ({
        currency,
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