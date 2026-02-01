"use client"

import { GoalsCard } from "@/components/goals-card"
import { AddGoalDialog } from "@/components/add-goal-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function GoalsPage() {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
                <AddGoalDialog>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Goal</Button>
                </AddGoalDialog>
            </div>
            <div className="flex-1 min-h-0">
                <GoalsCard />
            </div>
        </div>
    )
}
