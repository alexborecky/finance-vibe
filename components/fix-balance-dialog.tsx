"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ArrowLeftRight, TrendingUp, Landmark } from "lucide-react"

interface FixBalanceDialogProps {
    isOpen: boolean
    onClose: () => void
    deficitAmount: number
    wantsBalance: number
    savingsBalance: number
    onConfirm: (source: 'want' | 'saving') => void
}

export function FixBalanceDialog({
    isOpen,
    onClose,
    deficitAmount,
    wantsBalance,
    savingsBalance,
    onConfirm
}: FixBalanceDialogProps) {
    const [selectedSource, setSelectedSource] = useState<'want' | 'saving'>('want')

    const handleConfirm = () => {
        onConfirm(selectedSource)
        onClose()
    }

    const deficit = Math.abs(deficitAmount)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                        Fix Negative Balance
                    </DialogTitle>
                    <DialogDescription>
                        You are over budget by <span className="font-bold text-red-600">{deficit.toLocaleString('cs-CZ')} Kč</span> in Needs.
                        Select a funding source to cover this deficit.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup defaultValue="want" onValueChange={(v) => setSelectedSource(v as 'want' | 'saving')} className="grid gap-4">
                        {/* Wants Option */}
                        <div>
                            <RadioGroupItem value="want" id="source-want" className="peer sr-only" />
                            <Label
                                htmlFor="source-want"
                                className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex w-full items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        Wants Fund
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                        Recommended
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground w-full">
                                    Available: <span className={wantsBalance < deficit ? "text-red-500" : "text-foreground"}>
                                        {wantsBalance.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>
                                {wantsBalance < deficit && (
                                    <div className="text-xs text-red-500 mt-1">Warning: This will result in negative Wants balance.</div>
                                )}
                            </Label>
                        </div>

                        {/* Savings Option */}
                        <div>
                            <RadioGroupItem value="saving" id="source-savings" className="peer sr-only" />
                            <Label
                                htmlFor="source-savings"
                                className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <div className="flex w-full items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Landmark className="h-4 w-4 text-emerald-600" />
                                        Savings Fund
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Available: <span className={savingsBalance < deficit ? "text-red-500" : "text-foreground"}>
                                        {savingsBalance.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="text-xs text-muted-foreground w-1/2 mt-2 sm:mt-0">
                        This action will create offsetting transactions to balance your Needs bucket.
                    </div>
                    <Button onClick={handleConfirm} disabled={(selectedSource === 'want' && wantsBalance < deficit) && false}>
                        Confirm Fix
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
