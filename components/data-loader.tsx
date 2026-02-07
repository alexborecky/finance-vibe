'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useFinanceStore } from '@/lib/store'

export function DataLoader({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth()
    const { loadUserData, clearData, initialized } = useFinanceStore()

    useEffect(() => {
        if (!loading && user && profile && !initialized) {
            loadUserData(user.id, profile)
        } else if (!loading && !user) {
            clearData()
        }
    }, [user, profile, loading, initialized, loadUserData, clearData])

    return <>{children}</>
}
