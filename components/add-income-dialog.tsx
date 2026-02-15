"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useFinanceStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Transaction } from "@/lib/finance-engine"
import { useAuth } from "@/lib/auth/auth-context"

const formSchema = z.object({
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    date: z.date(),
    distribution: z.object({
        needs: z.boolean(),
        wants: z.boolean(),
        savings: z.boolean(),
    })
})

interface AddIncomeDialogProps {
    existingTransaction?: Transaction | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export function AddIncomeDialog({
    existingTransaction,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    children
}: AddIncomeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen || setInternalOpen;
    const { user } = useAuth()

    const { addTransaction, updateTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: "",
            date: new Date(),
            distribution: {
                needs: true,
                wants: true,
                savings: true,
            }
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (existingTransaction) {
                const dist = existingTransaction.metadata?.incomeDistribution;
                form.reset({
                    description: existingTransaction.description || "",
                    amount: String(existingTransaction.amount),
                    date: new Date(existingTransaction.date),
                    distribution: {
                        needs: dist?.needs ?? true,
                        wants: dist?.wants ?? true,
                        savings: dist?.savings ?? true,
                    },
                })
            } else {
                form.reset({
                    description: "",
                    amount: "",
                    date: new Date(),
                    distribution: {
                        needs: true,
                        wants: true,
                        savings: true,
                    }
                })
            }
        }
    }, [isOpen, existingTransaction, form])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user && !existingTransaction) return

        setIsSubmitting(true)
        setError(null)

        try {
            const metadata = {
                incomeDistribution: values.distribution
            };

            if (existingTransaction) {
                await updateTransaction(existingTransaction.id, {
                    amount: Number(values.amount),
                    description: values.description,
                    category: 'income',
                    date: values.date,
                    metadata
                })
            } else if (user) {
                await addTransaction({
                    amount: Number(values.amount),
                    description: values.description,
                    category: 'income',
                    date: values.date,
                    metadata
                }, user.id)
            }
            setIsOpen(false)
            form.reset()
        } catch (e: any) {
            console.error("Error saving income:", e)
            setError(e.message || "Failed to save income.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button><Plus className="mr-2 h-4 w-4" /> Add Extra Income</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingTransaction ? "Edit Income" : "Add One-time Income"}</DialogTitle>
                    <DialogDescription>
                        {existingTransaction ? "Update income details." : "Record a gift, bonus, or other one-time income."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bonus, Gift, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (CZK)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="5000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3 pt-2">
                            <FormLabel>Include in</FormLabel>
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="distribution.needs"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-muted-foreground">
                                                Needs
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="distribution.wants"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-muted-foreground">
                                                Wants
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="distribution.savings"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-muted-foreground">
                                                Savings
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : (existingTransaction ? "Save Changes" : "Save Income")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
