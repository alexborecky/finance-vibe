
import { isDemoMode } from '@/lib/utils';
import * as supabaseService from './transactions.supabase';
import { mockTransactionsService } from '@/lib/demo/services/transactions';
import type { Database } from '@/lib/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export async function getTransactions(userId: string): Promise<Transaction[]> {
    if (isDemoMode()) {
        return mockTransactionsService.getTransactions(userId);
    }
    return supabaseService.getTransactions(userId);
}

export async function createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    if (isDemoMode()) {
        return mockTransactionsService.createTransaction(transaction);
    }
    return supabaseService.createTransaction(transaction);
}

export async function updateTransaction(id: string, updates: TransactionUpdate): Promise<Transaction> {
    if (isDemoMode()) {
        return mockTransactionsService.updateTransaction(id, updates);
    }
    return supabaseService.updateTransaction(id, updates);
}

export async function deleteTransaction(id: string): Promise<void> {
    if (isDemoMode()) {
        return mockTransactionsService.deleteTransaction(id);
    }
    return supabaseService.deleteTransaction(id);
}
