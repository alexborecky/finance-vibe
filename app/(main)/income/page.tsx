"use client"

import { IncomeProjectionTable } from "@/components/income-projection-table"
import { IncomeInput } from "@/components/income-input"
import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets } from "@/lib/finance-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Edit, TrendingUp, AlertCircle, PiggyBank, Plus } from "lucide-react"
import { useState } from "react"
import { AddIncomeDialog } from "@/components/add-income-dialog"

export default function IncomePage() {
    const incomeConfig = useFinanceStore(state => state.incomeConfig)
    const monthlyIncome = calculateMonthlyIncome(incomeConfig)
    const buckets = calculateBuckets(monthlyIncome)
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Income</h2>
                <div className="flex gap-2">
                    <AddIncomeDialog />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" /> Configuration
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Income Configuration</DialogTitle>
                                <DialogDescription>Adjust your primary income settings below.</DialogDescription>
                            </DialogHeader>
                            <div className="pt-4">
                                <IncomeInput
                                    className="border-0 shadow-none m-0 w-full max-w-full"
                                    onSave={() => setOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Overview Cards (Hidden but kept in DOM) */}
            <div className="hidden">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="md:col-span-1 border-l-4 border-l-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Monthly Net Income</CardTitle>
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{monthlyIncome.toLocaleString('cs-CZ')} Kč</div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Needs (50%)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{buckets.needs.toLocaleString('cs-CZ')} Kč</div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Wants (30%)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{buckets.wants.toLocaleString('cs-CZ')} Kč</div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Savings (20%)</CardTitle>
                            <PiggyBank className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{buckets.savings.toLocaleString('cs-CZ')} Kč</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0">
                <IncomeProjectionTable className="border-0 shadow-none" />
            </div>
        </div>
    )
}
