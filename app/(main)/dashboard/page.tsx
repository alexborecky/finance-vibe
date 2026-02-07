"use client"

import { DashboardOverview } from "@/components/dashboard-overview";
import { GoalsCard } from "@/components/goals-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/lib/store";
import { format } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
    const { transactions } = useFinanceStore();

    // Get the 5 most recent transactions, excluding recurring sources (if they are templates)
    // Actually the store handles instances, so we just sort by date
    const recentTransactions = [...transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 6);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'income':
                return <ArrowDownRight className="h-4 w-4 text-emerald-600" />;
            case 'saving':
                return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
            case 'want':
                return <ArrowUpRight className="h-4 w-4 text-purple-600" />;
            case 'need':
            default:
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'income':
                return "bg-emerald-100 dark:bg-emerald-900/30";
            case 'saving':
                return "bg-blue-100 dark:bg-blue-900/30";
            case 'want':
                return "bg-purple-100 dark:bg-purple-900/30";
            case 'need':
            default:
                return "bg-red-100 dark:bg-red-900/30";
        }
    };

    return (
        <div className="flex flex-col gap-8 flex-1 min-h-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* KPI Cards */}
            <DashboardOverview />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Goals Section (Takes up more space now) */}
                <div className="col-span-4 lg:col-span-4">
                    <GoalsCard />
                </div>

                {/* Recent Transactions / Quick Actions */}
                <div className="col-span-3 lg:col-span-3 flex flex-col gap-4">
                    <Card className="flex-1 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Latest activity</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                                <Link href="/expenses">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full ${getCategoryStyles(tx.category)} flex items-center justify-center`}>
                                                {getCategoryIcon(tx.category)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">{tx.description || tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{tx.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${tx.category === 'income' ? 'text-emerald-600' : ''}`}>
                                                {tx.category === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} Kč
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{format(tx.date, 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                        <Receipt className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                                    <Button size="sm" variant="outline" className="mt-4" asChild>
                                        <Link href="/expenses">Add Expense</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
