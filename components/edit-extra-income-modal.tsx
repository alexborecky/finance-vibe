"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, ArrowRight } from "lucide-react"
import { useFinanceStore } from "@/lib/store"
import { Transaction } from "@/lib/finance-engine"
import { format, isSameMonth } from "date-fns"
import { useAuth } from "@/lib/auth/auth-context"

interface EditExtraIncomeModalProps {
    date: Date
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditExtraIncomeModal({
    date,
    open,
    onOpenChange,
}: EditExtraIncomeModalProps) {
    const { transactions, updateTransaction, deleteTransaction, addTransaction } = useFinanceStore()
    const { user } = useAuth()

    const extraIncomes = React.useMemo(() => {
        return transactions.filter(t =>
            t.category === 'income' &&
            isSameMonth(t.date, date)
        )
    }, [transactions, date])

    const handleUpdate = (id: string, updates: Partial<Transaction>) => {
        updateTransaction(id, updates)
    }

    const handleDelete = (id: string) => {
        deleteTransaction(id)
    }

    const handleAddNew = () => {
        if (!user) return
        addTransaction({
            amount: 0,
            description: "New income",
            category: 'income',
            date: date,
        }, user.id)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Extra Income - {format(date, "MMMM yyyy")}</DialogTitle>
                    <DialogDescription>
                        Manage your extra income for this month. Changes are saved automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {extraIncomes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>No extra income for this month</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={handleAddNew}>
                                <Plus className="mr-2 h-4 w-4" /> Add Income
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {extraIncomes.map((income) => (
                                <div key={income.id} className="group relative flex flex-col gap-3 p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor={`desc-${income.id}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Description</Label>
                                            <Input
                                                id={`desc-${income.id}`}
                                                value={income.description || ""}
                                                onChange={(e) => handleUpdate(income.id, { description: e.target.value })}
                                                placeholder="e.g. Bonus, Freelance project"
                                                className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                                            />
                                        </div>
                                        <div className="w-[140px] space-y-1">
                                            <Label htmlFor={`amount-${income.id}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amount (Kč)</Label>
                                            <div className="relative">
                                                <Input
                                                    id={`amount-${income.id}`}
                                                    type="number"
                                                    value={income.amount || ""}
                                                    onChange={(e) => handleUpdate(income.id, { amount: Number(e.target.value) || 0 })}
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 pr-8"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Kč</div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5"
                                            onClick={() => handleDelete(income.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button variant="outline" className="w-full border-dashed" onClick={handleAddNew}>
                                <Plus className="mr-2 h-4 w-4" /> Add Another Income
                            </Button>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Monthly Total</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">
                                {extraIncomes.reduce((sum, inc) => sum + inc.amount, 0).toLocaleString('cs-CZ')}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">Kč</span>
                        </div>
                    </div>
                    <Button onClick={() => onOpenChange(false)} size="lg" className="px-8 shadow-lg shadow-primary/20">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
