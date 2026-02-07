import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

// Helper to add timeout to promises
function withTimeout<T>(promise: PromiseLike<T>, ms: number, timeoutError = 'Operation timed out'): Promise<T> {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const duration = Date.now() - startTime;
            console.error(`[withTimeout] TIMED OUT after ${duration}ms (limit: ${ms}ms). Error: ${timeoutError}`);
            reject(new Error(timeoutError));
        }, ms);

        promise.then(
            (value) => {
                const duration = Date.now() - startTime;
                console.log(`[withTimeout] Succeeded after ${duration}ms`);
                clearTimeout(timer);
                resolve(value);
            },
            (reason) => {
                const duration = Date.now() - startTime;
                console.error(`[withTimeout] Failed after ${duration}ms:`, reason);
                clearTimeout(timer);
                reject(reason);
            }
        );
    });
}

const TIMEOUT_MS = 15000; // 15 seconds

export async function getTransactions(userId: string): Promise<Transaction[]> {
    const supabase = createClient()

    try {
        const result = await withTimeout((supabase as any)
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false }), TIMEOUT_MS) as any

        if (result.error) {
            console.error('Error fetching transactions:', result.error)
            throw result.error
        }

        return result.data || []
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        throw error;
    }
}

export async function createTransaction(
    transaction: TransactionInsert
): Promise<Transaction> {
    const supabase = createClient()
    console.log('[Service] creating transaction:', transaction);

    try {
        // We use .select() instead of .select().single() to avoid potential strictness issues
        // or locking behaviors that sometimes occur with .single() on immediate inserts
        const result = await withTimeout((supabase as any)
            .from('transactions')
            .insert(transaction), TIMEOUT_MS) as any

        if (result.error) {
            console.error('Error creating transaction:', result.error)
            console.error('Error details:', result.error.message, result.error.details, result.error.hint)
            throw result.error
        }

        // Since we removed .select(), we return a simulated Transaction object
        // with the known values to satisfy the store.
        console.log('[Service] transaction created (optimistically returning inserted data)');
        return {
            ...transaction,
            id: transaction.id!,
            created_at: new Date().toISOString(),
            date: transaction.date! as any, // Supabase expects string but store uses Date
        } as Transaction
    } catch (error) {
        console.error('Failed to create transaction (caught in service):', error);
        throw error;
    }
}

export async function updateTransaction(
    id: string,
    updates: TransactionUpdate
): Promise<Transaction> {
    const supabase = createClient()
    console.log('[Service] updating transaction:', id, updates);

    try {
        const result = await withTimeout((supabase as any)
            .from('transactions')
            .update(updates)
            .eq('id', id), TIMEOUT_MS) as any

        if (result.error) {
            console.error('Error updating transaction:', JSON.stringify(result.error, null, 2))
            console.error('Failed ID:', id)
            console.error('Failed Updates:', updates)
            console.error('Error details:', result.error.message, result.error.details, result.error.hint)
            throw result.error
        }

        console.log('[Service] transaction updated');
        // Return simulated updated object
        return { id, ...updates } as any
    } catch (error) {
        console.error('Failed to update transaction (caught in service):', error);
        throw error;
    }
}

export async function deleteTransaction(id: string): Promise<void> {
    const supabase = createClient()

    try {
        const result = await withTimeout((supabase as any)
            .from('transactions')
            .delete()
            .eq('id', id), TIMEOUT_MS) as any

        if (result.error) {
            console.error('Error deleting transaction:', result.error)
            throw result.error
        }
    } catch (error) {
        console.error('Failed to delete transaction:', error);
        throw error;
    }
}
