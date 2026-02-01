"use client"

import { DashboardOverview } from "@/components/dashboard-overview";
import { GoalsCard } from "@/components/goals-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* KPI Cards */}
            <DashboardOverview />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[500px]">
                {/* Goals Section (Takes up more space now) */}
                <div className="col-span-4 lg:col-span-4 h-full">
                    <GoalsCard />
                </div>

                {/* Recent Transactions / Quick Actions */}
                <div className="col-span-3 lg:col-span-3 h-full flex flex-col gap-4">
                    <Card className="flex-1 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Latest activity</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost">View All</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mock Transactions List */}
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Rent</p>
                                        <p className="text-xs text-muted-foreground">Needs</p>
                                    </div>
                                </div>
                                <span className="font-semibold">-15,000 Kč</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <ArrowUpRight className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Coffee</p>
                                        <p className="text-xs text-muted-foreground">Wants</p>
                                    </div>
                                </div>
                                <span className="font-semibold">-450 Kč</span>
                            </div>
                        </CardContent>
                    </Card>


                </div>
            </div>
        </div>
    )
}
