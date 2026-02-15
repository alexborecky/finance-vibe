"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinanceStore } from "@/lib/store"
import { AlertTriangle, Anchor, Edit2, ShieldCheck, Sparkles, Trophy } from "lucide-react"
import { AddFundDialog } from "./add-fund-dialog"
import { Button } from "./ui/button"
import { Badge } from "@/components/ui/badge"
import { getEmergencyFundStats } from "@/lib/supabase/services/reserves"
import { useAuth } from "@/lib/auth/auth-context"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FinancialGoal } from "@/lib/finance-engine"

export function FundCard() {
    const { goals } = useFinanceStore()
    const { user } = useAuth()
    const [stats, setStats] = useState<{ minTarget: number; fortress: number } | null>(null)

    // Filter for Fund types
    // Support both old 'emergency'/'sinking' types (during migration) and new 'reserve' type
    const funds = goals.filter(g => g.type === 'reserve' || (g.type as any) === 'emergency' || (g.type as any) === 'sinking')

    useEffect(() => {
        if (user) {
            getEmergencyFundStats(user.id).then(data => {
                setStats(data.recommended)
            }).catch(console.error)
        }
    }, [user])

    if (funds.length === 0) {
        return (
            <Card className="h-full shadow-md">
                <CardHeader>
                    <CardTitle>Funds & Security</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <ShieldCheck className="h-8 w-8 text-slate-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Build Your Safety Net</h3>
                    <p className="text-muted-foreground max-w-xs mb-6">
                        Prepare for the unexpected with an emergency fund or save for irregular expenses.
                    </p>
                    <AddFundDialog>
                        <Button>Create Fund</Button>
                    </AddFundDialog>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full shadow-md flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Funds & Security</CardTitle>
                <AddFundDialog>
                    <Button size="sm" variant="outline" className="h-8"><Sparkles className="mr-2 h-3 w-3" /> Add Fund</Button>
                </AddFundDialog>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
                {funds.map(goal => (
                    <AddFundDialog key={goal.id} existingFund={goal}>
                        <div className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 transition-all hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
                            <FundItem goal={goal} stats={stats} />
                        </div>
                    </AddFundDialog>
                ))}
            </CardContent>
        </Card>
    )
}

function FundItem({ goal, stats }: { goal: FinancialGoal, stats: { minTarget: number; fortress: number } | null }) {
    const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    const remaining = goal.targetAmount - goal.currentAmount

    // Determine badges based on amount relative to stats
    // Only show these badges if it's an "Emergency Fund" template or seemingly an emergency fund
    const isEmergency = goal.metadata?.template === 'emergency' || (goal.type as any) === 'emergency' || goal.name.toLowerCase().includes('emergency')

    const reached3Months = stats && goal.currentAmount >= stats.minTarget
    const reached6Months = stats && goal.currentAmount >= stats.fortress

    // Icon handling
    let Icon = ShieldCheck
    let color = "text-emerald-600"

    if (goal.metadata?.template === 'sinking' || (goal.type as any) === 'sinking') {
        Icon = Anchor
        color = "text-blue-600"
    } else if (!isEmergency) {
        Icon = Sparkles
        color = "text-purple-600"
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-md`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                        <div className="font-medium flex items-center gap-2">
                            {goal.name}
                            {isEmergency && reached6Months && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary" className="h-5 px-1.5 bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 text-[10px]">
                                            <Trophy className="h-3 w-3" /> Fortress
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>6 Months Covered</TooltipContent>
                                </Tooltip>
                            )}
                            {isEmergency && !reached6Months && reached3Months && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary" className="h-5 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1 text-[10px]">
                                            <ShieldCheck className="h-3 w-3" /> Stability
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>3 Months Covered</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                            {goal.currentAmount.toLocaleString('cs-CZ')} Kč of {goal.targetAmount.toLocaleString('cs-CZ')} Kč
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg">{percentage}%</div>
                </div>
            </div>

            <Progress value={percentage} className="h-2" />

            <div className="flex justify-between items-center text-xs">
                <div className="text-muted-foreground">
                    {remaining > 0 ? `${remaining.toLocaleString('cs-CZ')} Kč to go` : 'Goal Reached! 🎉'}
                </div>

                {/* Suggestion to increase target */}
                {isEmergency && reached3Months && !reached6Months && goal.targetAmount < stats!.fortress && (
                    <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium animate-pulse">
                        <Sparkles className="h-3 w-3" />
                        <span>Increase to 6 months?</span>
                    </div>
                )}
            </div>
        </div>
    )
}
