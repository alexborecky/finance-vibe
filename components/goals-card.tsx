"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinanceStore } from "@/lib/store"
import { PiggyBank, Laptop, Home, Edit2 } from "lucide-react"
import { AddGoalDialog } from "./add-goal-dialog"
import { Button } from "./ui/button"

export function GoalsCard() {
    const { goals } = useFinanceStore()

    // Separate Short-term (Wants bucket) vs Long-term (Savings bucket)
    const shortTermGoals = goals.filter(g => g.type === 'short-term')
    const longTermGoals = goals.filter(g => g.type === 'long-term')

    return (
        <Card className="h-full shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-indigo-500" />
                        Financial Goals
                    </CardTitle>
                    <CardDescription>Track your progress towards targets.</CardDescription>
                </div>
                <AddGoalDialog>
                    <Button size="sm" variant="outline">Add Goal</Button>
                </AddGoalDialog>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">

                {/* Short Term Section */}
                {shortTermGoals.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Short Term (From 30% Wants)</h4>
                        {shortTermGoals.map(goal => (
                            <AddGoalDialog key={goal.id} existingGoal={goal}>
                                <div className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 rounded-md transition-colors">
                                    <GoalItem goal={goal} icon={Laptop} />
                                </div>
                            </AddGoalDialog>
                        ))}
                    </div>
                )}

                {/* Long Term Section */}
                {longTermGoals.length > 0 && (
                    <div className="space-y-4 pt-2 border-t">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">Long Term (From 20% Savings)</h4>
                        {longTermGoals.map(goal => (
                            <AddGoalDialog key={goal.id} existingGoal={goal}>
                                <div className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 rounded-md transition-colors">
                                    <GoalItem goal={goal} icon={Home} />
                                </div>
                            </AddGoalDialog>
                        ))}
                    </div>
                )}

                {goals.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">No goals set yet.</p>
                        <AddGoalDialog>
                            <Button variant="outline">Create your first goal</Button>
                        </AddGoalDialog>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function GoalItem({ goal, icon: Icon }: { goal: any, icon: any }) {
    const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    const remaining = goal.targetAmount - goal.currentAmount

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                            {goal.name}
                            <Edit2 className="h-3 w-3 text-muted-foreground opacity-50" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {goal.currentAmount.toLocaleString('cs-CZ')} Kč of {goal.targetAmount.toLocaleString('cs-CZ')} Kč
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-sm">{percentage}%</div>
                    <div className="text-xs text-muted-foreground">{remaining.toLocaleString('cs-CZ')} Kč to go</div>
                </div>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    )
}
