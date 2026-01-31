"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets } from "@/lib/finance-engine"
import { format } from "date-fns"

export function IncomeProjectionTable({ className }: { className?: string }) {
    const incomeConfig = useFinanceStore(state => state.incomeConfig)

    // For MVP, we assume constant income based on current config for the whole year presentation
    // In a real app, we might store monthly variations.
    const monthlyNet = calculateMonthlyIncome(incomeConfig)
    const buckets = calculateBuckets(monthlyNet)

    const currentYear = new Date().getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1))

    return (
        <div className={`rounded-md border bg-card text-card-foreground shadow-sm ${className}`}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Month</TableHead>
                        <TableHead className="text-right">Net Income</TableHead>
                        <TableHead className="text-right text-purple-600 dark:text-purple-400">Safe to Spend (30%)</TableHead>
                        <TableHead className="text-right text-blue-600 dark:text-blue-400">Needs (50%)</TableHead>
                        <TableHead className="text-right text-emerald-600 dark:text-emerald-400">Savings (20%)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {months.map((date) => (
                        <TableRow key={date.toISOString()}>
                            <TableCell className="font-medium">
                                {format(date, "MMMM")}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {monthlyNet.toLocaleString('cs-CZ')} Kč
                            </TableCell>
                            <TableCell className="text-right">
                                {buckets.wants.toLocaleString('cs-CZ')} Kč
                            </TableCell>
                            <TableCell className="text-right">
                                {buckets.needs.toLocaleString('cs-CZ')} Kč
                            </TableCell>
                            <TableCell className="text-right">
                                {buckets.savings.toLocaleString('cs-CZ')} Kč
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
