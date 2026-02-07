'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SignupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('token')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [verifyingToken, setVerifyingToken] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        // Verify the invitation token
        const verifyToken = async () => {
            if (!inviteToken) {
                setError('Invalid invitation link')
                setVerifyingToken(false)
                return
            }

            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .eq('token', inviteToken)
                .eq('used', false)
                .single()

            if (error || !data) {
                setError('Invalid or expired invitation')
                setVerifyingToken(false)
                return
            }

            // Check if invitation is expired
            if (new Date((data as any).expires_at) < new Date()) {
                setError('This invitation has expired')
                setVerifyingToken(false)
                return
            }

            setEmail((data as any).email)
            setVerifyingToken(false)
        }

        verifyToken()
    }, [inviteToken])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        // Create the user account
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        // Mark invitation as used
        if (inviteToken) {
            await (supabase
                .from('invitations' as any) as any)
                .update({ used: true } as any)
                .eq('token', inviteToken)
        }

        // Redirect to login
        router.push('/auth/login?message=Account created successfully. Please sign in.')
    }

    if (verifyingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">Verifying invitation...</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error && !inviteToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invalid Invitation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => router.push('/auth/login')} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                    <CardDescription>
                        Complete your registration to access Finance Vibe
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && error !== 'Invalid invitation link' && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <a href="/auth/login" className="text-primary hover:underline">
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">Loading...</div>
                    </CardContent>
                </Card>
            </div>
        }>
            <SignupContent />
        </Suspense>
    )
}
