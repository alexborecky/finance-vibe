'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Send } from 'lucide-react'

export default function AskInvitePage() {
    const router = useRouter()
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        address: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setStatus('success')
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
                <Card className="w-full max-w-md text-center py-8">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-4">
                            <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Request Sent!</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Thanks for your interest. We'll review your request and get back to you soon.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center pt-6">
                        <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl px-8">
                            Back to Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-t-4 border-t-primary">
                <CardHeader>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit mb-2 -ml-2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-2xl font-bold">Ask for Invitation</CardTitle>
                    <CardDescription>
                        Fill in your details and we'll reach out to you with access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">First Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={status === 'submitting'}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Last Name</Label>
                                <Input
                                    id="surname"
                                    placeholder="Doe"
                                    value={formData.surname}
                                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                    required
                                    disabled={status === 'submitting'}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Main St 123, Prague"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                disabled={status === 'submitting'}
                                className="rounded-lg"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition-all"
                            disabled={status === 'submitting'}
                        >
                            {status === 'submitting' ? 'Submitting...' : 'Request Invitation'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
