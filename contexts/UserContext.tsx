import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { renameUserDatabase } from '../services/db';

export interface User {
    username: string;
    email: string;
    registeredAt: string;
}

// NOTE: Storing plain text passwords in local storage is insecure and should NEVER be done in a real application.
// This is done here only for the purpose of this sandboxed, client-side-only example.
type UserAccount = {
    password: string;
    username: string;
    registeredAt: string;
}
type UserAccounts = Record<string, UserAccount> // Keyed by lowercase email

interface UserContextType {
    currentUser: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    updateUser: (newUsername: string) => Promise<{ success: boolean; message?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_ACCOUNTS_KEY = 'smartmoney_user_accounts';
const CURRENT_USER_KEY = 'smartmoney_current_user';

const getStoredAccounts = (): UserAccounts => {
    try {
        const stored = localStorage.getItem(USER_ACCOUNTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to parse user accounts from localStorage", e);
        return {};
    }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem(CURRENT_USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse current user from localStorage", e);
            return null;
        }
    });

    const isEmailTaken = useCallback((email: string): boolean => {
        const accounts = getStoredAccounts();
        return !!accounts[email.toLowerCase()];
    }, []);

    const isUsernameTaken = useCallback((username: string): boolean => {
        const accounts = getStoredAccounts();
        const lowerCaseUsername = username.toLowerCase();
        return Object.values(accounts).some(acc => acc.username.toLowerCase() === lowerCaseUsername);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        const accounts = getStoredAccounts();
        const account = accounts[email.toLowerCase()];
        
        if (!account) {
            return { success: false, message: 'No account found with that email.' };
        }

        if (account.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }

        const user: User = {
            username: account.username,
            email: email,
            registeredAt: account.registeredAt,
        };
        
        setCurrentUser(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return { success: true };
    }, []);

    const register = useCallback(async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        const lowerCaseEmail = email.toLowerCase();
        
        if (isEmailTaken(lowerCaseEmail)) {
            return { success: false, message: 'An account with this email already exists.' };
        }
        
        if (isUsernameTaken(username)) {
            return { success: false, message: 'This username is already taken.' };
        }

        const accounts = getStoredAccounts();
        const newUserAccount: UserAccount = {
            password, // Again, don't do this in a real app!
            username,
            registeredAt: new Date().toISOString()
        };
        accounts[lowerCaseEmail] = newUserAccount;
        localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
        
        // After registering, automatically log them in
        return login(email, password);
    }, [isEmailTaken, isUsernameTaken, login]);

    const updateUser = useCallback(async (newUsername: string): Promise<{ success: boolean; message?: string }> => {
        const trimmedUsername = newUsername.trim();
        if (!currentUser) {
            return { success: false, message: 'No user is logged in.' };
        }
        if (currentUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
            return { success: true }; // No change needed
        }
        if (!/^[a-zA-Z0-9_]{3,15}$/.test(trimmedUsername)) {
            return { success: false, message: 'Username must be 3-15 characters and contain only letters, numbers, or underscores.' };
        }
        if (isUsernameTaken(trimmedUsername)) {
            return { success: false, message: 'This username is already taken.' };
        }
    
        const oldUsername = currentUser.username;
    
        const dbRenamed = await renameUserDatabase(oldUsername, trimmedUsername);
        if (!dbRenamed) {
            return { success: false, message: 'Failed to update user data. Please try again.' };
        }
    
        const accounts = getStoredAccounts();
        const userAccount = accounts[currentUser.email.toLowerCase()];
        if (userAccount) {
            userAccount.username = trimmedUsername;
            localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
        }

        const newUser: User = { ...currentUser, username: trimmedUsername };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        setCurrentUser(newUser);
    
        return { success: true };
    }, [currentUser, isUsernameTaken]);
    
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
        // Reloading the page is a simple and effective way to clear all state.
        window.location.reload();
    };
    
    const value = useMemo(() => ({ currentUser, login, logout, register, updateUser }), [currentUser, login, logout, register, updateUser]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};