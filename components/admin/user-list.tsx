'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { getAllUsers, updateUserRole } from '@/lib/supabase/services/admin'
import type { Database } from '@/lib/supabase/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Shield, User } from 'lucide-react'
import { format } from 'date-fns'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserListProps {
    isSuperAdmin: boolean
}

export function UserList({ isSuperAdmin }: UserListProps) {
    const { user } = useAuth()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers()
            setUsers(data)

            // Update stats
            const totalUsersEl = document.getElementById('total-users')
            if (totalUsersEl) totalUsersEl.textContent = data.length.toString()
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
        try {
            await updateUserRole(userId, newRole)
            await fetchUsers() // Refresh list
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return <Badge className="bg-purple-500"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
            case 'admin':
                return <Badge className="bg-blue-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
            default:
                return <Badge variant="outline"><User className="h-3 w-3 mr-1" />User</Badge>
        }
    }

    if (loading) {
        return <div className="text-center py-4">Loading users...</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Income Mode</TableHead>
                        <TableHead>Created</TableHead>
                        {isSuperAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((profile) => (
                        <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                                {profile.email}
                                {profile.id === user?.id && (
                                    <Badge variant="secondary" className="ml-2">You</Badge>
                                )}
                            </TableCell>
                            <TableCell>{getRoleBadge(profile.role)}</TableCell>
                            <TableCell className="capitalize">{profile.income_mode}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(profile.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            {isSuperAdmin && (
                                <TableCell>
                                    {profile.role !== 'superadmin' && profile.id !== user?.id && (
                                        <Select
                                            value={profile.role}
                                            onValueChange={(value) => handleRoleChange(profile.id, value as 'admin' | 'user')}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {(profile.role === 'superadmin' || profile.id === user?.id) && (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
