"use client"

import { useState, useEffect } from "react"
import { format, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, isFuture, isPast, isThisMonth } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { Transaction, BudgetBuckets } from "@/lib/finance-engine"

interface SavingsTableProps {
    year?: number
    recommendedSavings: number
    buckets: BudgetBuckets
    transactions: Transaction[]
    onEditMonth: (date: Date) => void
    onUpdateCurrentMonth: (amount: number) => void
}

export function SavingsTable({
    year = new Date().getFullYear(),
    recommendedSavings,
    buckets,
    transactions,
    onEditMonth,
    onUpdateCurrentMonth
}: SavingsTableProps) {
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
    })

    return (
        <div className="flex flex-col border rounded-lg transition-colors overflow-hidden h-full bg-background border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between">
                <h3 className="font-semibold text-lg">Monthly Savings</h3>
            </div>

            <div className="flex-1 overflow-auto bg-background/30">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Target (20%)</TableHead>
                            <TableHead className="text-right text-blue-600">Needs Expenses Leftover</TableHead>
                            <TableHead className="text-right text-purple-600">Wants Expenses Leftover</TableHead>
                            <TableHead className="text-right font-bold text-foreground">Final Amount Saved</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {months.map((month) => {
                            const isCurrent = isThisMonth(month)

                            // 1. Get Expenses for this month and calc leftovers
                            // Needs
                            const monthNeeds = transactions.filter(t =>
                                t.category === 'need' && isSameMonth(new Date(t.date), month)
                            )
                            const spentNeeds = monthNeeds.reduce((acc, t) => acc + t.amount, 0)
                            const needsLeftover = buckets.needs - spentNeeds

                            // Wants
                            const monthWants = transactions.filter(t =>
                                t.category === 'want' && isSameMonth(new Date(t.date), month)
                            )
                            const spentWants = monthWants.reduce((acc, t) => acc + t.amount, 0)
                            const wantsLeftover = buckets.wants - spentWants

                            // 2. Actual Saving Transaction?
                            const monthSavings = transactions.filter(t =>
                                t.category === 'saving' && isSameMonth(new Date(t.date), month)
                            )
                            const manualSaved = monthSavings.reduce((acc, t) => acc + t.amount, 0)

                            // 3. Final Amount Saved
                            // If user manually added a saving transaction, use it.
                            // Otherwise, use the formula (Target + Leftovers).
                            const formulaSaved = recommendedSavings + needsLeftover + wantsLeftover
                            const isManuallyOverridden = monthSavings.length > 0
                            const finalSaved = isManuallyOverridden ? manualSaved : formulaSaved

                            // 4. Percentage Logic
                            const percentage = recommendedSavings > 0 ? (finalSaved / recommendedSavings) * 100 : 0

                            const isFutureMonth = isFuture(month)

                            return (
                                <TableRow key={month.toISOString()} className={cn(isCurrent && "bg-slate-50 dark:bg-slate-900/50")}>
                                    <TableCell className="font-medium">
                                        {format(month, 'MMMM')}
                                        {isCurrent && <span className="ml-2 text-xs text-blue-600 font-normal">(Current)</span>}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {recommendedSavings.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className={cn("text-right", needsLeftover < 0 ? "text-red-500 font-medium" : "text-blue-600")}>
                                        {!isFutureMonth ? needsLeftover.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }) : "—"}
                                    </TableCell>
                                    <TableCell className={cn("text-right", wantsLeftover < 0 ? "text-red-500 font-medium" : "text-purple-600")}>
                                        {!isFutureMonth ? wantsLeftover.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }) : "—"}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-bold group relative pr-12", finalSaved < recommendedSavings ? "text-red-600" : "text-green-700")}>
                                        {!isFutureMonth ? (
                                            <div className="flex items-center justify-end">
                                                <span className={cn(isManuallyOverridden && "underline decoration-dotted underline-offset-4")}>
                                                    {finalSaved.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2"
                                                    onClick={() => onEditMonth(month)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-medium text-xs", percentage < 100 ? "text-red-600" : "text-slate-500")}>
                                        {!isFutureMonth ? `${percentage.toFixed(0)}%` : "—"}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function CurrentMonthInput({ amount, onSave }: { amount: number, onSave: (val: number) => void }) {
    const [value, setValue] = useState(amount.toString())

    // Sync if external amount changes (e.g. initial load or websocket update)
    useEffect(() => {
        setValue(amount.toString())
    }, [amount])

    const handleBlur = () => {
        const num = parseFloat(value)
        if (!isNaN(num) && num >= 0) {
            onSave(num)
        } else {
            setValue(amount.toString()) // Reset on invalid
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.currentTarget as HTMLInputElement).blur()
        }
    }

    return (
        <div className="flex justify-end">
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="h-8 w-28 text-right font-mono"
                placeholder="0"
            />
        </div>
    )
}
