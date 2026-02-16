
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']
type GoalUpdate = Database['public']['Tables']['goals']['Update']

export async function getReserves(userId: string): Promise<Goal[]> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'reserve')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reserves:', error)
        throw error
    }

    return data || []
}

export async function getEmergencyFundStats(userId: string) {
    const supabase = createClient()

    // Fetch recurring 'needs'
    const { data: transactions, error } = await (supabase as any)
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category', 'need')
        .eq('is_recurring', true)

    if (error) {
        console.error('Error fetching emergency stats:', error)
        return { averageMonthlyNeeds: 0, recommended: { minTarget: 0, fortress: 0 } }
    }

    const monthlyNeeds = transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

    return {
        averageMonthlyNeeds: monthlyNeeds,
        recommended: {
            minTarget: monthlyNeeds * 3,
            fortress: monthlyNeeds * 6
        }
    }
}

export async function createReserve(reserve: GoalInsert): Promise<Goal> {
    const supabase = createClient()

    // Ensure type is reserve
    const reserveData = { ...reserve, type: 'reserve' as const }

    const { data, error } = await (supabase
        .from('goals') as any)
        .insert(reserveData)
        .select()
        .single()

    if (error) {
        console.error('Error creating reserve:', error)
        throw error
    }

    return data
}

export async function updateReserve(id: string, updates: GoalUpdate): Promise<Goal> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating reserve:', error)
        throw error
    }

    return data
}

export async function deleteReserve(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting reserve:', error)
        throw error
    }
}
