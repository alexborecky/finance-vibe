import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']
type GoalUpdate = Database['public']['Tables']['goals']['Update']

export async function getGoals(userId: string): Promise<Goal[]> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching goals:', error)
        throw error
    }

    return data || []
}

export async function createGoal(goal: Omit<GoalInsert, 'id' | 'created_at'>): Promise<Goal> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('goals')
        .insert(goal)
        .select()
        .single()

    if (error) {
        console.error('Error creating goal:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw error
    }

    return data
}

export async function updateGoal(id: string, updates: GoalUpdate): Promise<Goal> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating goal:', error)
        throw error
    }

    return data
}

export async function deleteGoal(id: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting goal:', error)
        throw error
    }
}

export async function updateGoalProgress(id: string, amount: number): Promise<Goal> {
    return updateGoal(id, { current_amount: amount })
}
