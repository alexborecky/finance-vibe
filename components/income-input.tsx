"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeConfig, calculateMonthlyIncome, calculateBuckets } from "@/lib/finance-engine"
import { useFinanceStore } from "@/lib/store"
import { Check } from "lucide-react"

interface IncomeInputProps {
    redirectOnSave?: string;
    onSave?: () => void;
    className?: string;
}

export function IncomeInput({ redirectOnSave, onSave, className }: IncomeInputProps) {
    const router = useRouter()
    const { setIncomeConfig, incomeConfig } = useFinanceStore()

    // Initialize local state from global store
    const [mode, setMode] = useState<IncomeConfig['mode']>(incomeConfig.mode)
    const [amount, setAmount] = useState<string>(
        incomeConfig.mode !== 'hourly' ? String(incomeConfig.amount) : ""
    )
    const [hourlyRate, setHourlyRate] = useState<string>(
        incomeConfig.mode === 'hourly' ? String(incomeConfig.hourlyRate) : ""
    )
    const [hoursPerWeek, setHoursPerWeek] = useState<string>(
        incomeConfig.mode === 'hourly' ? String(incomeConfig.hoursPerWeek) : ""
    )
    const [tax, setTax] = useState<string>(
        incomeConfig.mode === 'hourly' && incomeConfig.tax ? String(incomeConfig.tax) : ""
    )
    const [paymentDelay, setPaymentDelay] = useState<boolean>(
        incomeConfig.mode === 'hourly' ? !!incomeConfig.paymentDelay : false
    )

    const [calculatedIncome, setCalculatedIncome] = useState<number | null>(null)

    // Auto-calculate on mount
    useEffect(() => {
        handleCalculate(false) // Don't save, just calc
    }, [])

    const handleCalculate = (save: boolean = false) => {
        let income = 0
        let config: IncomeConfig;

        if (mode === 'fixed') {
            config = { mode: 'fixed', amount: Number(amount) || 0 };
        } else if (mode === 'manual') {
            config = { mode: 'manual', amount: Number(amount) || 0 };
        } else {
            config = {
                mode: 'hourly',
                hourlyRate: Number(hourlyRate) || 0,
                hoursPerWeek: Number(hoursPerWeek) || 0,
                tax: Number(tax) || 0,
                paymentDelay: paymentDelay,
                adjustments: incomeConfig.mode === 'hourly' ? incomeConfig.adjustments : {}
            };
        }

        income = calculateMonthlyIncome(config);
        setCalculatedIncome(income);

        if (save) {
            setIncomeConfig(config);
            if (onSave) onSave();
            if (redirectOnSave) {
                router.push(redirectOnSave);
            }
        }
    }

    const buckets = calculatedIncome ? calculateBuckets(calculatedIncome) : null

    return (
        <Card className={`w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in zoom-in duration-500 ${className}`}>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">Income Settings</CardTitle>
                <CardDescription>Configure your income source to calculate limits.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="fixed">Fixed</TabsTrigger>
                        <TabsTrigger value="hourly">Hourly</TabsTrigger>
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4">
                        {mode === 'fixed' && (
                            <div className="space-y-2">
                                <Label htmlFor="fixed-amount">Monthly Net Income (CZK)</Label>
                                <Input
                                    id="fixed-amount"
                                    type="number"
                                    placeholder="30000"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="text-lg"
                                />
                            </div>
                        )}

                        {mode === 'hourly' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hourly-rate">Hourly Rate (CZK)</Label>
                                    <Input
                                        id="hourly-rate"
                                        type="number"
                                        placeholder="250"
                                        value={hourlyRate}
                                        onChange={e => setHourlyRate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hours-week">Hours per Week</Label>
                                    <Input
                                        id="hours-week"
                                        type="number"
                                        placeholder="40"
                                        value={hoursPerWeek}
                                        onChange={e => setHoursPerWeek(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax-amount">Total Tax Amount (Monthly)</Label>
                                    <Input
                                        id="tax-amount"
                                        type="number"
                                        placeholder="5000"
                                        value={tax}
                                        onChange={e => setTax(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">This amount will be subtracted from your total monthly income.</p>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="payment-delay"
                                        checked={paymentDelay}
                                        onCheckedChange={(checked) => setPaymentDelay(checked as boolean)}
                                    />
                                    <Label htmlFor="payment-delay" className="font-normal cursor-pointer">
                                        Shift income to next month (Invoice Delay)
                                    </Label>
                                </div>
                            </div>
                        )}

                        {mode === 'manual' && (
                            <div className="space-y-2">
                                <Label htmlFor="manual-amount">Enter Amount (CZK)</Label>
                                <Input
                                    id="manual-amount"
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Adjust this manually as needed for irregular income.</p>
                            </div>
                        )}
                    </div>
                </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                {/* Real-time Buckets Preview */}
                {calculatedIncome !== null && buckets && (
                    <div className="w-full space-y-3 pt-4 border-t mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Est. Monthly Income</span>
                            <span className="font-bold text-xl">{calculatedIncome.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-center">
                                <div className="text-xs text-muted-foreground">Needs (50%)</div>
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                    {buckets.needs.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded text-center">
                                <div className="text-xs text-muted-foreground">Wants (30%)</div>
                                <div className="font-semibold text-purple-600 dark:text-purple-400">
                                    {buckets.wants.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded text-center">
                                <div className="text-xs text-muted-foreground">Savings (20%)</div>
                                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {buckets.savings.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={() => handleCalculate(false)}>
                        Preview
                    </Button>
                    <Button className="flex-1" onClick={() => handleCalculate(true)}>
                        <Check className="mr-2 h-4 w-4" /> Save & Continue
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

