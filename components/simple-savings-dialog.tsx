"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { useEffect } from "react"
import { Transaction } from "@/lib/finance-engine"

const formSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Amount must be a positive number",
    }),
})

interface SimpleSavingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date?: Date;
    defaultAmount?: string;
    existingTransaction?: Transaction | null;
}

export function SimpleSavingsDialog({
    open,
    onOpenChange,
    date,
    defaultAmount,
    existingTransaction,
}: SimpleSavingsDialogProps) {
    const { addTransaction, updateTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: defaultAmount || "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                amount: existingTransaction ? String(existingTransaction.amount) : (defaultAmount || ""),
            })
        }
    }, [open, existingTransaction, defaultAmount, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (existingTransaction) {
            updateTransaction(existingTransaction.id, {
                amount: Number(values.amount),
            })
        } else if (date) {
            addTransaction({
                id: crypto.randomUUID(),
                amount: Number(values.amount),
                category: 'saving',
                date: date,
                description: 'Monthly Savings (Manual)',
            })
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Update Savings</DialogTitle>
                    <DialogDescription>
                        Set the final amount saved for this month.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Final Amount Saved (CZK)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. 15000"
                                            {...field}
                                            className="text-lg h-12"
                                            autoFocus
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="w-full">Save Amount</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
