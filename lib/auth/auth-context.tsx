'use client'


import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { isDemoMode } from '@/lib/utils'
import { mockAuthService } from '@/lib/demo/mockAuthService'
import { getProfile } from '@/lib/supabase/services/profile'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()


    const fetchProfile = async (userId: string) => {
        return getProfile(userId)
    }

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    useEffect(() => {
        if (isDemoMode()) {
            mockAuthService.getUser().then(async (mockUser) => {
                if (mockUser) {
                    setUser(mockUser)
                    const profileData = await fetchProfile(mockUser.id)
                    setProfile(profileData)
                }
                setLoading(false)
            })
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile)
            }

            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id)
                setProfile(profileData)
            } else {
                setProfile(null)
            }

            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])


    const signOut = async () => {
        if (isDemoMode()) {
            await mockAuthService.signOut()
            // In demo mode, we might want to just reload to reset state or clear user
            // But since our mock service is simple, we just clear user state here matching the flow
            setUser(null)
            setProfile(null)
            return
        }
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
