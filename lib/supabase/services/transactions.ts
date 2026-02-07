import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export async function getTransactions(userId: string): Promise<Transaction[]> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }

    return data || []
}

export async function createTransaction(
    transaction: Omit<TransactionInsert, 'id' | 'created_at'>
): Promise<Transaction> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

    if (error) {
        console.error('Error creating transaction:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        throw error
    }

    if (!data) {
        throw new Error('Failed to create transaction: No data returned from database')
    }

    return data
}

export async function updateTransaction(
    id: string,
    updates: TransactionUpdate
): Promise<Transaction> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating transaction:', JSON.stringify(error, null, 2))
        console.error('Failed ID:', id)
        console.error('Failed Updates:', updates)
        console.error('Error details:', error.message, error.details, error.hint)
        throw error
    }

    return data
}

export async function deleteTransaction(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting transaction:', error)
        throw error
    }
}
