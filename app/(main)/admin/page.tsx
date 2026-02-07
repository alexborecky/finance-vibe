'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserList } from '@/components/admin/user-list'
import { InviteUserDialog } from '@/components/admin/invite-user-dialog'
import { Shield, Users, Mail } from 'lucide-react'

export default function AdminPage() {
    const { profile, loading } = useAuth()
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (!loading && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
            router.push('/dashboard')
        }
    }, [profile, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div>Loading...</div>
            </div>
        )
    }

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
        return null
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage users and invitations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                        {profile.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" id="total-users">-</div>
                        <p className="text-xs text-muted-foreground">
                            Active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Invites
                        </CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" id="pending-invites">-</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting signup
                        </p>
                    </CardContent>
                </Card>

                <Card className="flex items-center justify-center">
                    <CardContent className="pt-6">
                        <InviteUserDialog onInviteCreated={() => setRefreshKey(prev => prev + 1)} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        View and manage user accounts and roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserList key={refreshKey} isSuperAdmin={profile.role === 'superadmin'} />
                </CardContent>
            </Card>
        </div>
    )
}
