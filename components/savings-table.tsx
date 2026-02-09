"use client"

import { useState } from "react"
import { format, eachMonthOfInterval, startOfYear, endOfYear, isFuture, isThisMonth, isSameMonth } from "date-fns"
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
import { Transaction, calculateMonthlyIncomeDetails } from "@/lib/finance-engine"
import { useFinanceStore } from "@/lib/store"
import { EditExtraSavingsModal } from "./edit-extra-savings-modal"

interface SavingsTableProps {
    year?: number
}

export function SavingsTable({
    year = new Date().getFullYear(),
}: SavingsTableProps) {
    const { transactions, incomeConfig } = useFinanceStore()
    const [editingMonth, setEditingMonth] = useState<{ date: Date } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const months = eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
    })

    const handleEditExtra = (date: Date) => {
        setEditingMonth({ date })
        setIsModalOpen(true)
    }

    return (
        <div className="flex flex-col border rounded-lg transition-colors overflow-hidden h-full bg-background border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between">
                <h3 className="font-semibold text-lg">Monthly Savings</h3>
            </div>

            <div className="flex-1 min-h-0 bg-background/30 overflow-hidden">
                <Table containerClassName="h-full overflow-y-auto">
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <TableRow className="hover:bg-transparent border-b-0">
                            <TableHead className="border-b">Month</TableHead>
                            <TableHead className="text-right border-b">Target (20%)</TableHead>
                            <TableHead className="text-right border-b text-emerald-600">Extra Savings</TableHead>
                            <TableHead className="text-right font-bold text-foreground border-b">Final Amount Saved</TableHead>
                            <TableHead className="text-right border-b">Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {months.map((month) => {
                            const isCurrent = isThisMonth(month)
                            const isFutureMonth = isFuture(month)

                            // 1. Calculate Income Details for this month to get Net Income & Target
                            const incomeDetails = calculateMonthlyIncomeDetails(incomeConfig, transactions, month)
                            // Target is 20% of Net Income
                            const targetSavings = incomeDetails.buckets.savings

                            // 2. Calculate Extra Savings
                            const monthSavings = transactions.filter(t =>
                                t.category === 'saving' && isSameMonth(new Date(t.date), month)
                            )
                            const extraSavingsTotal = monthSavings.reduce((acc, t) => acc + t.amount, 0)

                            // 3. Final Amount Saved
                            const finalSaved = targetSavings + extraSavingsTotal

                            // 4. Percentage Logic
                            const percentage = targetSavings > 0 ? (finalSaved / targetSavings) * 100 : 0

                            return (
                                <TableRow key={month.toISOString()} className={cn(isCurrent && "bg-slate-50 dark:bg-slate-900/50")}>
                                    <TableCell className="font-medium">
                                        {format(month, 'MMMM')}
                                        {isCurrent && <span className="ml-2 text-xs text-blue-600 font-normal">(Current)</span>}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {targetSavings.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 group">
                                            <span className={cn(extraSavingsTotal > 0 ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                                                {extraSavingsTotal > 0 ? `+${extraSavingsTotal.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}` : "—"}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
                                                onClick={() => handleEditExtra(month)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("text-right font-bold pr-8", finalSaved < targetSavings ? "text-red-600" : "text-green-700")}>
                                        {finalSaved.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-medium text-xs", percentage < 100 ? "text-red-600" : "text-slate-500")}>
                                        {(!isFutureMonth || percentage > 0) ? `${percentage.toFixed(0)}%` : "—"}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {editingMonth && (
                <EditExtraSavingsModal
                    date={editingMonth.date}
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
            )}
        </div>
    )
}
