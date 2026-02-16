
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

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

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
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

export async function updatePreferences(userId: string, preferences: any): Promise<Profile> {
    return updateProfile(userId, { preferences })
}

export async function updateIncomeConfig(userId: string, config: any): Promise<Profile> {
    return updateProfile(userId, config)
}
