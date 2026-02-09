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
import { Trash2, Plus } from "lucide-react"
import { useFinanceStore } from "@/lib/store"
import { Transaction } from "@/lib/finance-engine"
import { format, isSameMonth } from "date-fns"
import { AddExtraSavingDialog } from "./add-extra-saving-dialog"

interface EditExtraSavingsModalProps {
    date: Date
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditExtraSavingsModal({
    date,
    open,
    onOpenChange,
}: EditExtraSavingsModalProps) {
    const { transactions, updateTransaction, deleteTransaction } = useFinanceStore()
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)

    const extraSavings = React.useMemo(() => {
        return transactions.filter(t =>
            t.category === 'saving' &&
            isSameMonth(new Date(t.date), date)
        )
    }, [transactions, date])

    const handleUpdate = (id: string, updates: Partial<Transaction>) => {
        updateTransaction(id, updates)
    }

    const handleDelete = (id: string) => {
        deleteTransaction(id)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Extra Savings - {format(date, "MMMM yyyy")}</DialogTitle>
                        <DialogDescription>
                            Manage your extra savings for this month. Changes are saved automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        {extraSavings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No extra savings for this month</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Saving
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {extraSavings.map((saving) => (
                                    <div key={saving.id} className="group relative flex flex-col gap-3 p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <Label htmlFor={`desc-${saving.id}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Description</Label>
                                                <Input
                                                    id={`desc-${saving.id}`}
                                                    value={saving.description || ""}
                                                    onChange={(e) => handleUpdate(saving.id, { description: e.target.value })}
                                                    placeholder="e.g. Gift, Bonus..."
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                                                />
                                            </div>
                                            <div className="w-[140px] space-y-1">
                                                <Label htmlFor={`amount-${saving.id}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amount (Kč)</Label>
                                                <div className="relative">
                                                    <Input
                                                        id={`amount-${saving.id}`}
                                                        type="number"
                                                        value={saving.amount || ""}
                                                        onChange={(e) => handleUpdate(saving.id, { amount: Number(e.target.value) || 0 })}
                                                        className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 pr-8"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Kč</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5"
                                                onClick={() => handleDelete(saving.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Another Saving
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Monthly Total</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">
                                    {extraSavings.reduce((sum, inc) => sum + inc.amount, 0).toLocaleString('cs-CZ')}
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

            <AddExtraSavingDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                defaultDate={date}
            />
        </>
    )
}
