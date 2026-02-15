"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, ShieldAlert, BadgeCent, TrendingUp, ShieldCheck, Ambulance, Anchor, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFinanceStore } from "@/lib/store"
import { FinancialGoal } from "@/lib/finance-engine"
import { useAuth } from "@/lib/auth/auth-context"
import { getEmergencyFundStats } from "@/lib/supabase/services/reserves"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target amount must be positive",
    }),
    currentAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Current amount must be non-negative",
    }),
    monthlyContribution: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Contribution must be non-negative",
    }),
    createTransaction: z.boolean(),
    template: z.enum(['emergency', 'sinking', 'custom']),
    type: z.literal('reserve'),
})

interface AddFundDialogProps {
    existingFund?: FinancialGoal | null;
    children?: React.ReactNode;
}
export function AddFundDialog({ existingFund, children }: AddFundDialogProps) {
    const [open, setOpen] = useState(false)
    const [contributionEnabled, setContributionEnabled] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [stats, setStats] = useState<{ averageMonthlyNeeds: number; recommended: { minTarget: number; fortress: number } } | null>(null)
    const [loadingStats, setLoadingStats] = useState(false)

    const { user } = useAuth()
    const { addGoal, editGoal, removeGoal, addTransaction, updateTransaction, deleteTransaction, transactions } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            targetAmount: "",
            currentAmount: "0",
            monthlyContribution: "",
            createTransaction: false,
            template: 'custom',
            type: 'reserve' as const,
        },
    })

    // Fetch stats for Emergency Fund calculations
    const loadEmergencyStats = async () => {
        if (!user || stats) return stats;

        setLoadingStats(true)
        try {
            const data = await getEmergencyFundStats(user.id);
            setStats(data);
            return data;
        } catch (err) {
            console.error("Failed to fetch reserves stats", err);
            return null;
        } finally {
            setLoadingStats(false)
        }
    }

    // Initialize logic
    useEffect(() => {
        if (open) {
            if (existingFund) {
                form.reset({
                    name: existingFund.name,
                    targetAmount: String(existingFund.targetAmount),
                    currentAmount: String(existingFund.currentAmount),
                    monthlyContribution: "",
                    createTransaction: false,
                    template: existingFund.metadata?.template || 'custom',
                    type: 'reserve',
                })

                // Check for existing contribution transaction
                const descriptionPattern = `Saving for ${existingFund.name}`
                const existingTx = transactions.find(t => t.description === descriptionPattern && t.isRecurring)
                if (existingTx) {
                    setContributionEnabled(true)
                    form.setValue('monthlyContribution', String(existingTx.amount))
                    form.setValue('createTransaction', true)
                } else {
                    setContributionEnabled(false)
                }
            } else {
                form.reset({
                    name: "",
                    targetAmount: "",
                    currentAmount: "0",
                    monthlyContribution: "",
                    createTransaction: false,
                    template: 'custom',
                    type: 'reserve',
                })
                setContributionEnabled(false)
            }
        }
    }, [open, existingFund, form, transactions])

    const applyTemplate = async (template: 'emergency' | 'sinking') => {
        form.setValue('template', template);

        if (template === 'emergency') {
            form.setValue('name', 'Emergency Fund');
            const data = await loadEmergencyStats();
            if (data) {
                // Set default target to 3 months (minTarget)
                form.setValue('targetAmount', String(data.recommended.minTarget));
            }
        } else if (template === 'sinking') {
            form.setValue('name', 'Sinking Fund');
            form.setValue('targetAmount', ''); // Let user decide
        }
    }

    const [isSubmitting, setIsSubmitting] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;

        setIsSubmitting(true)

        try {
            const metadata = {
                template: values.template !== 'custom' ? values.template : undefined,
                // Store stats snapshot if emergency for reference? optional.
            };

            if (existingFund) {
                await editGoal(existingFund.id, {
                    name: values.name,
                    targetAmount: Number(values.targetAmount),
                    currentAmount: Number(values.currentAmount),
                    type: 'reserve', // Consolidated type
                    metadata: { ...existingFund.metadata, ...metadata }
                })
            } else {
                await addGoal({
                    name: values.name,
                    targetAmount: Number(values.targetAmount),
                    currentAmount: Number(values.currentAmount),
                    type: 'reserve',
                    savingStrategy: 'manual',
                    metadata: metadata
                }, user.id)
            }

            // Handle Automated Transactions
            const monthlyAmount = Number(values.monthlyContribution)

            if (contributionEnabled && monthlyAmount > 0) {
                const description = `Saving for ${values.name}`
                const oldDescription = existingFund ? `Saving for ${existingFund.name}` : description

                const existingTx = transactions.find(t => t.description === oldDescription && t.isRecurring);

                if (existingTx) {
                    await updateTransaction(existingTx.id, {
                        amount: monthlyAmount,
                        description: description,
                    })
                } else {
                    await addTransaction({
                        amount: monthlyAmount,
                        category: 'saving',
                        date: new Date(),
                        description: description,
                        isRecurring: true,
                    }, user.id)
                }
            } else if (existingFund && !contributionEnabled) {
                const oldDescription = `Saving for ${existingFund.name}`
                const existingTx = transactions.find(t => t.description === oldDescription && t.isRecurring);
                if (existingTx) {
                    await deleteTransaction(existingTx.id);
                }
            }

            setOpen(false)
            form.reset()
        } catch (e: any) {
            console.error("Error saving fund:", e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{existingFund ? "Edit Fund" : "Create Fund"}</DialogTitle>
                    <DialogDescription>
                        {existingFund ? "Update your fund details." : "Start by choosing a template or create a custom fund."}
                    </DialogDescription>
                </DialogHeader>

                {!existingFund && (
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <Button
                            variant="outline"
                            className="h-auto py-3 flex flex-col gap-1 items-center justify-center border-dashed hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            onClick={() => applyTemplate('emergency')}
                            type="button"
                        >
                            <ShieldCheck className="h-5 w-5 text-emerald-600 mb-1" />
                            <span className="font-semibold text-sm">Emergency Fund</span>
                            <span className="text-[10px] text-muted-foreground font-normal">3-6 months coverage</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-3 flex flex-col gap-1 items-center justify-center border-dashed hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            onClick={() => applyTemplate('sinking')}
                            type="button"
                        >
                            <Anchor className="h-5 w-5 text-blue-600 mb-1" />
                            <span className="font-semibold text-sm">Sinking Fund</span>
                            <span className="text-[10px] text-muted-foreground font-normal">For irregular expenses</span>
                        </Button>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Form Validation Errors:", errors))} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fund Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Emergency Fund" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimal Target (CZK)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="50000" {...field} />
                                                {loadingStats && (
                                                    <div className="absolute right-3 top-2.5">
                                                        <Sparkles className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        {form.watch('template') === 'emergency' && stats && (
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                Based on your recurring needs: <br />
                                                <span className="font-medium text-emerald-600">3 Months: {stats.recommended.minTarget.toLocaleString()} Kč</span>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Saved (CZK)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Monthly Contribution Section */}
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                            <div className="flex items-center justify-between">
                                <FormLabel className="flex flex-col gap-1">
                                    <span>Automated Monthly Contribution?</span>
                                    <span className="font-normal text-xs text-muted-foreground">Automatically deduct from Savings bucket</span>
                                </FormLabel>
                                <Switch
                                    checked={contributionEnabled}
                                    onCheckedChange={(checked) => {
                                        setContributionEnabled(checked)
                                        if (!checked) {
                                            form.setValue('monthlyContribution', '')
                                        }
                                    }}
                                />
                            </div>

                            {contributionEnabled && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <FormField
                                        control={form.control}
                                        name="monthlyContribution"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Amount (CZK)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="5000" {...field} />
                                                </FormControl>
                                                <div className="text-xs text-muted-foreground">
                                                    This will create a recurring transaction in your Expenses.
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                            {existingFund ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    Delete
                                </Button>
                            ) : <div></div>}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : (existingFund ? "Save Changes" : "Create Fund")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

            {existingFund && (
                <ConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    title="Delete Fund"
                    description={`Are you sure you want to delete "${existingFund.name}"? This will also remove any associated recurring payments.`}
                    variant="destructive"
                    onConfirm={() => {
                        removeGoal(existingFund.id, true);
                        setOpen(false);
                    }}
                />
            )}
        </Dialog>
    )
}
