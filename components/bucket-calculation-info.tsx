"use client"

import * as React from "react"
import { MonthlyIncomeDetails } from "@/lib/finance-engine"
import { Separator } from "@/components/ui/separator"

interface BucketCalculationInfoProps {
    category: 'needs' | 'wants';
    incomeDetails: MonthlyIncomeDetails;
}

export function BucketCalculationInfo({ category, incomeDetails }: BucketCalculationInfoProps) {
    const baseAmount = incomeDetails.baseBuckets[category];
    const isNeeds = category === 'needs';
    const percentage = isNeeds ? "50%" : "30%";

    return (
        <div className="p-4 space-y-4 w-[280px]">
            <div className="space-y-1">
                <h4 className="font-semibold text-sm leading-none">Calculation Breakdown</h4>
                <p className="text-xs text-muted-foreground">
                    How your {category} limit is calculated.
                </p>
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                        <span className="font-medium">Base Income</span>
                        <span className="text-[10px] text-muted-foreground">{percentage} of net salary</span>
                    </div>
                    <span className="font-mono">{baseAmount.toLocaleString('cs-CZ')} Kč</span>
                </div>

                {incomeDetails.extraIncomeAllocations.map((alloc, idx) => {
                    const contrib = alloc.contribution[category];
                    if (contrib === 0) return null;

                    return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium truncate max-w-[150px]">{alloc.description}</span>
                                <span className="text-[10px] text-muted-foreground">Extra Income contribution</span>
                            </div>
                            <span className="font-mono text-green-600">+{contrib.toLocaleString('cs-CZ')} Kč</span>
                        </div>
                    );
                })}

                <Separator />

                <div className="flex items-center justify-between font-bold text-sm pt-1">
                    <span>Total Limit</span>
                    <span>{incomeDetails.buckets[category].toLocaleString('cs-CZ')} Kč</span>
                </div>
            </div>
        </div>
    )
}
