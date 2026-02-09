"use client"

import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets, calculateMonthlyIncomeDetails } from "@/lib/finance-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SavingsTable } from "@/components/savings-table"
import { Progress } from "@/components/ui/progress"
import { Landmark, Plus } from "lucide-react"
import { eachMonthOfInterval, startOfYear, endOfYear, isSameMonth } from "date-fns"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AddExtraSavingDialog } from "@/components/add-extra-saving-dialog"

export default function SavingsPage() {
    const { user } = useAuth()
    const { incomeConfig, transactions } = useFinanceStore()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    // 1. Calculate Aggregates for Overview
    const currentYear = new Date().getFullYear()
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(currentYear, 0, 1)),
        end: endOfYear(new Date(currentYear, 0, 1))
    })

    let totalSavedYTD = 0
    let projectedAnnualTotal = 0
    let totalTargetYTD = 0

    months.forEach(month => {
        // Calculate Target and Actual for each month using the new logic
        const incomeDetails = calculateMonthlyIncomeDetails(incomeConfig, transactions, month)
        const targetSavings = incomeDetails.buckets.savings

        // Actual Savings = Target + Extra
        const monthSavings = transactions.filter(t =>
            t.category === 'saving' && isSameMonth(new Date(t.date), month)
        )
        const extraSavingsTotal = monthSavings.reduce((acc, t) => acc + t.amount, 0)

        const finalSaved = targetSavings + extraSavingsTotal
        const isFutureMonth = month > new Date()

        totalTargetYTD += targetSavings

        if (isFutureMonth && extraSavingsTotal === 0) {
            // Projected for future is just the target
            projectedAnnualTotal += targetSavings
        } else {
            totalSavedYTD += finalSaved
            projectedAnnualTotal += finalSaved
        }
    })

    const annualTarget = totalTargetYTD

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Savings</h2>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Extra Saving
                </Button>
            </div>

            {/* Overview Card */}
            <Card className="shadow-sm border-l-4 border-l-green-600 bg-green-50/10 py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Annual Savings Progress</CardTitle>
                    <Landmark className="h-3.5 w-3.5 text-green-600" />
                </CardHeader>
                <CardContent className="px-4">
                    <div className="flex justify-between items-end mb-1.5">
                        <div className="text-xl font-bold text-green-700 dark:text-green-500">
                            {totalSavedYTD.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                            <span className="text-xs font-normal text-muted-foreground ml-1.5">saved YTD</span>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                            Projected: {projectedAnnualTotal.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                        </div>
                    </div>

                    <Progress value={projectedAnnualTotal > 0 ? (totalSavedYTD / projectedAnnualTotal) * 100 : 0} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-green-600" />

                    <div className="mt-1.5 text-[10px] text-muted-foreground">
                        Target: {annualTarget.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })} / year
                    </div>
                </CardContent>
            </Card>

            {/* Savings Table */}
            <div className="flex-1 min-h-0">
                <SavingsTable />
            </div>

            <AddExtraSavingDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </div>
    )
}
