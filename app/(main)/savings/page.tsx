"use client"

import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { TransactionList } from "@/components/transaction-list"
import { PiggyBank } from "lucide-react"

export default function SavingsPage() {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Savings</h2>
                    <p className="text-muted-foreground">
                        Track your contributions towards financial freedom (20%).
                    </p>
                </div>
                <AddExpenseDialog defaultCategory="saving" />
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-lg">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Savings Account</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Funds allocated here should be moved to a separate high-yield account.
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-md">
                <TransactionList filter="saving" className="h-full border-0" />
            </div>
        </div>
    )
}
