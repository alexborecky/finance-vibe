'use client'

import { useState } from 'react'
import { inviteUser } from '@/app/actions/invite'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { UserPlus, Copy, Check, Mail } from 'lucide-react'

interface InviteUserDialogProps {
    onInviteCreated: () => void
}

export function InviteUserDialog({ onInviteCreated }: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'admin' | 'user'>('user')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ message?: string; inviteUrl?: string; success?: boolean } | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCreateInvite = async () => {
        if (!email) return

        setLoading(true)
        try {
            const response = await inviteUser(email, role)

            if (response.success) {
                setResult({
                    message: response.message,
                    inviteUrl: response.inviteUrl,
                    success: true
                })
                onInviteCreated()
            } else {
                alert(response.error || 'Failed to send invitation')
            }
        } catch (error) {
            console.error('Error creating invitation:', error)
            alert('Failed to create invitation. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyInviteUrl = () => {
        if (result?.inviteUrl) {
            navigator.clipboard.writeText(result.inviteUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setEmail('')
        setRole('user')
        setResult(null)
        setCopied(false)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) handleClose()
        }}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                    <DialogDescription>
                        Send an email invitation to onboard a new user
                    </DialogDescription>
                </DialogHeader>

                {!result?.success ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'user')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleCreateInvite}
                            disabled={loading || !email}
                            className="w-full"
                        >
                            {loading ? 'Sending Invitation...' : 'Send Invitation'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`rounded-md p-4 border ${result.message?.includes('failed') ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                            <p className={`text-sm font-medium mb-1 ${result.message?.includes('failed') ? 'text-amber-800' : 'text-green-800'}`}>
                                {result.message?.includes('failed') ? '⚠ Invitation Created but Email Failed' : '✓ Invitation Sent Successfully'}
                            </p>
                            <p className={`text-xs ${result.message?.includes('failed') ? 'text-amber-600' : 'text-green-600'}`}>
                                {result.message?.includes('failed')
                                    ? result.message
                                    : `An email has been sent to ${email}`}
                            </p>
                        </div>

                        {result.inviteUrl && (
                            <div className="space-y-2">
                                <Label>Invitation Link (Backup)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={result.inviteUrl}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyInviteUrl}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    You can share this link manually if the email fails.
                                </p>
                            </div>
                        )}

                        <Button onClick={handleClose} className="w-full">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
