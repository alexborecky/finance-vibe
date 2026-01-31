"use client"

import { useState } from "react"
import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets, Transaction } from "@/lib/finance-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SavingsTable } from "@/components/savings-table"
import { SimpleSavingsDialog } from "@/components/simple-savings-dialog"
import { Progress } from "@/components/ui/progress"
import { Landmark, TrendingUp } from "lucide-react"
import { eachMonthOfInterval, startOfYear, endOfYear, isSameMonth } from "date-fns"

export default function SavingsPage() {
    const { incomeConfig, transactions, addTransaction, updateTransaction } = useFinanceStore()

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogDate, setDialogDate] = useState<Date | undefined>(undefined)
    const [existingTransaction, setExistingTransaction] = useState<Transaction | null>(null)
    const [calculatedDefaultAmount, setCalculatedDefaultAmount] = useState<string>("")

    // 1. Calculate Financials
    const monthlyIncome = calculateMonthlyIncome(incomeConfig)
    const buckets = calculateBuckets(monthlyIncome)
    const recommendedSavings = buckets.savings

    // 2. Calculate Aggregates for Overview
    const currentYear = new Date().getFullYear()
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(currentYear, 0, 1)),
        end: endOfYear(new Date(currentYear, 0, 1))
    })

    let totalSavedYTD = 0
    let projectedAnnualTotal = 0

    months.forEach(month => {
        // Find spent amounts
        const spentNeeds = transactions
            .filter(t => t.category === 'need' && isSameMonth(new Date(t.date), month))
            .reduce((acc, t) => acc + t.amount, 0)

        const spentWants = transactions
            .filter(t => t.category === 'want' && isSameMonth(new Date(t.date), month))
            .reduce((acc, t) => acc + t.amount, 0)

        // Calculate leftovers (clamped at 0 for "bonus" savings, or allow negative to show overspending impact?)
        // The user said: "Sum of target, and expenses leftovers". 
        // If I overspend, leftover is negative.
        const needsLeftover = buckets.needs - spentNeeds
        const wantsLeftover = buckets.wants - spentWants

        // Final Saved logic: Manual override > Matrix Formula
        const monthSavings = transactions.filter(t =>
            t.category === 'saving' && isSameMonth(new Date(t.date), month)
        )
        const manualSavedTotal = monthSavings.reduce((acc, t) => acc + t.amount, 0)

        const monthFinalSaved = monthSavings.length > 0
            ? manualSavedTotal
            : (recommendedSavings + needsLeftover + wantsLeftover)

        const isFutureMonth = month > new Date()

        if (isFutureMonth && monthSavings.length === 0) {
            // For future, we project the target (recommendedSavings) 
            // and assume 0 leftover (perfect budget adherence)
            projectedAnnualTotal += recommendedSavings
        } else {
            totalSavedYTD += monthFinalSaved
            projectedAnnualTotal += monthFinalSaved
        }
    })

    const annualTarget = recommendedSavings * 12
    // If projection exceeds target (saved extra), that's fine.

    // 3. Handlers
    const handleUpdateCurrentMonth = (amount: number) => {
        const now = new Date()
        const currentMonthTransactions = transactions.filter(t =>
            t.category === 'saving' && isSameMonth(new Date(t.date), now)
        )

        if (currentMonthTransactions.length > 0) {
            // Update the first one (consolidate? For now, update first)
            updateTransaction(currentMonthTransactions[0].id, { amount })
        } else {
            // Create new
            addTransaction({
                id: crypto.randomUUID(),
                date: now,
                amount,
                category: 'saving',
                description: 'Monthly Savings'
            })
        }
    }

    const handleEditMonth = (date: Date) => {
        setDialogDate(date)

        // Find spent amounts for this month to calculate the default suggestion
        const spentNeeds = transactions
            .filter(t => t.category === 'need' && isSameMonth(new Date(t.date), date))
            .reduce((acc, t) => acc + t.amount, 0)

        const spentWants = transactions
            .filter(t => t.category === 'want' && isSameMonth(new Date(t.date), date))
            .reduce((acc, t) => acc + t.amount, 0)

        const needsLeftover = buckets.needs - spentNeeds
        const wantsLeftover = buckets.wants - spentWants
        const suggestedAmount = Math.max(0, recommendedSavings + needsLeftover + wantsLeftover)

        setCalculatedDefaultAmount(String(suggestedAmount))

        // Check if there is already a transaction for this month
        const monthTransactions = transactions.filter(t =>
            t.category === 'saving' && isSameMonth(new Date(t.date), date)
        )

        if (monthTransactions.length > 0) {
            setExistingTransaction(monthTransactions[0])
        } else {
            setExistingTransaction(null)
        }

        setIsDialogOpen(true)
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Savings</h2>
            </div>

            {/* Overview Card */}
            <Card className="shadow-sm border-l-4 border-l-green-600 bg-green-50/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Annual Savings Progress</CardTitle>
                    <Landmark className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-500">
                            {totalSavedYTD.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                            <span className="text-sm font-normal text-muted-foreground ml-2">saved YTD</span>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                            Projected: {projectedAnnualTotal.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                        </div>
                    </div>

                    <Progress value={(totalSavedYTD / projectedAnnualTotal) * 100} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-green-600" />

                    <div className="mt-2 text-xs text-muted-foreground">
                        Target: {annualTarget.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })} / year
                    </div>
                </CardContent>
            </Card>

            {/* Savings Table */}
            <div className="flex-1 min-h-0">
                <SavingsTable
                    recommendedSavings={recommendedSavings}
                    buckets={buckets}
                    transactions={transactions}
                    onEditMonth={handleEditMonth}
                    onUpdateCurrentMonth={handleUpdateCurrentMonth}
                />
            </div>

            {/* Simple Edit Dialog */}
            <SimpleSavingsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                date={dialogDate}
                defaultAmount={calculatedDefaultAmount}
                existingTransaction={existingTransaction}
            />
        </div>
    )
}
