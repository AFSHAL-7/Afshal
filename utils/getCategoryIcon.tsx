import { TransactionCategory } from '../types';
import { FoodIcon, BillsIcon, ShoppingIcon, TransportIcon, EntertainmentIcon, HealthIcon, SalaryIcon, OtherIcon } from '../components/icons/Icons';

export const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
        case TransactionCategory.Food:
            return FoodIcon;
        case TransactionCategory.Bills:
            return BillsIcon;
        case TransactionCategory.Shopping:
            return ShoppingIcon;
        case TransactionCategory.Transport:
            return TransportIcon;
        case TransactionCategory.Entertainment:
            return EntertainmentIcon;
        case TransactionCategory.Health:
            return HealthIcon;
        case TransactionCategory.Salary:
        case TransactionCategory.Freelance:
            return SalaryIcon;
        default:
            return OtherIcon;
    }
};

export const getCategoryBadgeStyle = (category: TransactionCategory): string => {
    switch (category) {
        case TransactionCategory.Food:
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case TransactionCategory.Bills:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case TransactionCategory.Shopping:
            return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
        case TransactionCategory.Transport:
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        case TransactionCategory.Entertainment:
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        case TransactionCategory.Health:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case TransactionCategory.Salary:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case TransactionCategory.Freelance:
            return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
        case TransactionCategory.Other:
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};
