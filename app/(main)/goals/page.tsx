"use client"

import { GoalsCard } from "@/components/goals-card"

export default function GoalsPage() {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Financial Goals</h2>
                <p className="text-muted-foreground">
                    Set and track your savings targets.
                </p>
            </div>
            <div className="flex-1 min-h-0">
                <GoalsCard />
            </div>
        </div>
    )
}
