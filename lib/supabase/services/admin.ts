import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Invitation = Database['public']['Tables']['invitations']['Row']

export async function getAllUsers(): Promise<Profile[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }

    return data || []
}


export async function getInvitations(userId: string): Promise<Invitation[]> {
    const supabase = createClient()

    const { data, error } = await (supabase
        .from('invitations' as any) as any)
        .select('*')
        .eq('invited_by', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching invitations:', error)
        throw error
    }

    return data || []
}

export async function updateUserRole(
    userId: string,
    role: 'admin' | 'user'
): Promise<void> {
    const supabase = createClient()

    const { error } = await (supabase
        .from('profiles' as any) as any)
        .update({ role } as any)
        .eq('id', userId)

    if (error) {
        console.error('Error updating user role:', error)
        throw error
    }
}

export async function deleteUser(userId: string): Promise<void> {
    // Note: This will only work if you have proper permissions set up
    // You may need to create a server-side function for this
    const supabase = createClient()

    const { error } = await (supabase
        .from('profiles' as any) as any)
        .delete()
        .eq('id', userId)

    if (error) {
        console.error('Error deleting user:', error)
        throw error
    }
}
