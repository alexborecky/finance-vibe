import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}

export async function updateProfile(
    userId: string,
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating profile:', error)
        throw error
    }

    return data
}

export async function updateIncomeConfig(
    userId: string,
    incomeConfig: {
        income_mode: 'fixed' | 'hourly' | 'manual'
        income_amount?: number
        hourly_rate?: number
        hours_per_week?: number
        tax_rate?: number
        payment_delay?: boolean
        income_adjustments?: Record<string, number>
    }
): Promise<void> {
    const supabase = createClient()

    const { error } = await (supabase as any)
        .from('profiles')
        .update(incomeConfig as any)
        .eq('id', userId)

    if (error) {
        console.error('Error updating income config:', error)
        throw error
    }
}

export async function updatePreferences(
    userId: string,
    preferences: Record<string, any>
): Promise<void> {
    const supabase = createClient()

    const { error } = await (supabase as any)
        .from('profiles')
        .update({ preferences })
        .eq('id', userId)

    if (error) {
        console.error('Error updating preferences:', error)
        throw error
    }
}
