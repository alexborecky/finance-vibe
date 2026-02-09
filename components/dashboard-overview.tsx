"use client"

import { useFinanceStore } from "@/lib/store"
import { calculateFinanceOverview } from "@/lib/finance-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, PiggyBank, TrendingUp, AlertCircle } from "lucide-react"

export function DashboardOverview() {
    // Subscribe to the necessary state slices
    const incomeConfig = useFinanceStore(state => state.incomeConfig)
    const transactions = useFinanceStore(state => state.transactions)
    const goals = useFinanceStore(state => state.goals)

    // Derive the overview
    const overview = calculateFinanceOverview(incomeConfig, transactions, goals)
    const { totalIncome, buckets } = overview

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* SAFE TO SPEND (Wants Remaining) */}
            <Card className="shadow-sm border-l-4 border-l-purple-500 py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Safe to Spend (Wants)</CardTitle>
                    <DollarSign className="h-3.5 w-3.5 text-purple-600" />
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-xl font-bold">{buckets.wants.safeToSpend.toLocaleString('cs-CZ')} Kč</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Of {buckets.wants.allocated.toLocaleString('cs-CZ')} Kč allocated
                    </p>
                </CardContent>
            </Card>

            {/* SAVINGS PROGRESS */}
            <Card className="shadow-sm border-l-4 border-l-emerald-500 py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Total Savings</CardTitle>
                    <PiggyBank className="h-3.5 w-3.5 text-emerald-600" />
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-xl font-bold">{buckets.savings.allocated.toLocaleString('cs-CZ')} Kč</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Reserved for Long-Term Goals
                    </p>
                </CardContent>
            </Card>

            {/* NEEDS TRACKER */}
            <Card className="shadow-sm border-l-4 border-l-blue-500 py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Needs Status</CardTitle>
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                </CardHeader>
                <CardContent className="px-4">
                    <div className={`text-xl font-bold ${buckets.needs.remaining < 0 ? 'text-red-500' : ''}`}>
                        {buckets.needs.remaining.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Remaining from {buckets.needs.allocated.toLocaleString('cs-CZ')} Kč
                    </p>
                </CardContent>
            </Card>

            {/* INCOME SUMMARY */}
            <Card className="shadow-sm py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Est. Net Income</CardTitle>
                    <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
                </CardHeader>
                <CardContent className="px-4">
                    <div className="text-xl font-bold">{totalIncome.toLocaleString('cs-CZ')} Kč</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Based on current settings
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
