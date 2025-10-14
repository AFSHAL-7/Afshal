import Dexie, { Table } from 'dexie';
import React from 'react';
import { Transaction, Account, TransactionCategory, Profile } from '../types';
import { GooglePayIcon, PhonePeIcon, BankIcon } from '../components/icons/Icons';

// Type for account stored in DB, storing icon as a string identifier
export interface DBAccount {
    id: string;
    name: string;
    type: 'UPI' | 'Bank';
    icon: string;
}

// SmartMoneyDB is a Dexie subclass that defines the database schema.
// Extending Dexie allows us to strongly type our tables and ensures
// we have access to all of Dexie's API methods like .open(), .version(), etc.
export class SmartMoneyDB extends Dexie {
    transactions!: Table<Transaction, string>;
    accounts!: Table<DBAccount, string>;
    budget!: Table<{ category: TransactionCategory; amount: number }, TransactionCategory>;
    profiles!: Table<Profile, string>;

    constructor(databaseName: string) {
        super(databaseName);
        // Dexie versions must be declared in ascending order.
        // Version 1 schema
        this.version(1).stores({
            transactions: 'id, date, type, category',
            budget: 'category',
        });
        
        // Version 2 schema: adds accounts and profiles tables.
        // All existing tables must be re-declared.
        this.version(2).stores({
            transactions: 'id, date, type, category', // Index fields for efficient querying
            accounts: 'id',
            budget: 'category', // Primary key
            profiles: 'username', // Primary key
        });
        // Dexie will automatically create the new `accounts` and `profiles` tables
        // when upgrading from version 1 to 2. No explicit `.upgrade()` is needed.
    }
}

// Cache for DB instances
const dbInstances = new Map<string, SmartMoneyDB>();

export function getDbForUser(username: string): SmartMoneyDB {
    if (!username) {
        throw new Error("Username is required to get a database instance.");
    }
    
    // Return cached instance if it exists
    if (dbInstances.has(username)) {
        return dbInstances.get(username)!;
    }
    
    // Create a new instance with a user-specific name and cache it
    const dbName = `SmartMoneyDB_${username}`;
    const db = new SmartMoneyDB(dbName);

    dbInstances.set(username, db);
    return db;
}


// Helper to get the actual icon component from its string name
export const getAccountIconComponent = (iconName: string): React.ElementType => {
    switch(iconName) {
        case 'GooglePayIcon': return GooglePayIcon;
        case 'PhonePeIcon': return PhonePeIcon;
        case 'BankIcon': return BankIcon;
        default: return BankIcon;
    }
};

// Convert a DBAccount record into an Account object usable by the UI
export const fromDBAccount = (dbAccount: DBAccount): Account => ({
    ...dbAccount,
    icon: getAccountIconComponent(dbAccount.icon),
});

// Convert a UI Account object into a DBAccount record for storage
export const toDBAccount = (account: Account): DBAccount => {
    let iconName = 'BankIcon';
    if (account.icon === GooglePayIcon) iconName = 'GooglePayIcon';
    else if (account.icon === PhonePeIcon) iconName = 'PhonePeIcon';
    
    return { ...account, icon: iconName };
};


export async function renameUserDatabase(oldUsername: string, newUsername: string): Promise<boolean> {
    try {
        const oldDbName = `SmartMoneyDB_${oldUsername}`;
        const newDbName = `SmartMoneyDB_${newUsername}`;

        const oldDb = getDbForUser(oldUsername);
        const newDb = getDbForUser(newUsername);
        
        await oldDb.open();
        
        // Export data from the old database
        const transactions = await oldDb.transactions.toArray();
        const accounts = await oldDb.accounts.toArray();
        const budget = await oldDb.budget.toArray();
        const profile = await oldDb.profiles.get(oldUsername);
        
        await newDb.open();
        
        // Import data into the new database
        await newDb.transaction('rw', newDb.transactions, newDb.accounts, newDb.budget, newDb.profiles, async () => {
            if (transactions.length > 0) await newDb.transactions.bulkAdd(transactions);
            if (accounts.length > 0) await newDb.accounts.bulkAdd(accounts);
            if (budget.length > 0) await newDb.budget.bulkAdd(budget);
            if (profile) await newDb.profiles.add({ ...profile, username: newUsername });
        });

        // Close connections before deleting
        oldDb.close();
        newDb.close();

        // Clear instances from the cache
        dbInstances.delete(oldUsername);
        dbInstances.delete(newUsername);

        // Delete the old database
        await Dexie.delete(oldDbName);
        
        return true;
    } catch (error) {
        console.error(`Failed to rename database for user ${oldUsername}`, error);
        return false;
    }
}