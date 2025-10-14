import { Transaction } from '../types';

const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // If the field contains a comma, double quote, or newline, wrap it in double quotes.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // Also, any double quotes within the field must be escaped by another double quote.
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const exportTransactionsToCsv = (filename: string, data: Transaction[]): void => {
    const headers = [
        'id', 'date', 'description', 'amount', 'type', 'category', 'source', 'notes', 'tags'
    ];
    
    const csvRows = [headers.join(',')]; // Header row

    for (const transaction of data) {
        const row = [
            escapeCsvField(transaction.id),
            escapeCsvField(transaction.date),
            escapeCsvField(transaction.description),
            escapeCsvField(transaction.amount),
            escapeCsvField(transaction.type),
            escapeCsvField(transaction.category),
            escapeCsvField(transaction.source),
            escapeCsvField(transaction.notes),
            escapeCsvField(transaction.tags?.join(';')), // Join tags with a semicolon for clarity
        ];
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
