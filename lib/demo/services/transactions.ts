
import { MOCK_TRANSACTIONS } from '../mockData';
import { Database } from '@/lib/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export const mockTransactionsService = {
    getTransactions: async (userId: string): Promise<Transaction[]> => {
        return MOCK_TRANSACTIONS as unknown as Transaction[];
    },

    createTransaction: async (transaction: TransactionInsert): Promise<Transaction> => {
        return {
            ...transaction,
            id: `tx-${Date.now()}`,
            created_at: new Date().toISOString(),
        } as Transaction;
    },

    updateTransaction: async (id: string, updates: TransactionUpdate): Promise<Transaction> => {
        const tx = MOCK_TRANSACTIONS.find((t) => t.id === id);
        if (!tx) throw new Error('Transaction not found');
        return { ...tx, ...updates } as unknown as Transaction;
    },

    deleteTransaction: async (id: string): Promise<void> => {
        return;
    }
};
