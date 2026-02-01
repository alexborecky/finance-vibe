import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets, getManDayRate, getWorkingDaysInMonth, IncomeConfig } from "@/lib/finance-engine"
import { format, subMonths } from "date-fns"
import { Info } from "lucide-react"

export function IncomeProjectionTable({ className }: { className?: string }) {
    const { incomeConfig, setIncomeConfig } = useFinanceStore()

    const currentYear = new Date().getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1))

    const handleFreeDaysChange = (monthKey: string, value: string) => {
        if (incomeConfig.mode !== 'hourly') return;

        const newAdjustments = {
            ...(incomeConfig.adjustments || {}),
            [monthKey]: Number(value) || 0
        };

        setIncomeConfig({
            ...incomeConfig,
            adjustments: newAdjustments
        });
    };

    return (
        <div className={`rounded-md border bg-card text-card-foreground shadow-sm ${className}`}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Month</TableHead>
                        {incomeConfig.mode === 'hourly' && (
                            <>
                                <TableHead className="text-right">Billable Days</TableHead>
                                <TableHead className="text-right w-[120px]">Free Days (Edit)</TableHead>
                            </>
                        )}
                        <TableHead className="text-right">Net Income</TableHead>
                        <TableHead className="text-right text-purple-600 dark:text-purple-400">Safe to Spend (30%)</TableHead>
                        <TableHead className="text-right text-blue-600 dark:text-blue-400">Needs (50%)</TableHead>
                        <TableHead className="text-right text-emerald-600 dark:text-emerald-400">Savings (20%)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {months.map((date) => {
                        // Calculate specific income for this month
                        const monthlyNet = calculateMonthlyIncome(incomeConfig, date);
                        const buckets = calculateBuckets(monthlyNet);

                        // If payment delay is active, we display working days from previous month
                        const effectiveDate = (incomeConfig.mode === 'hourly' && incomeConfig.paymentDelay)
                            ? subMonths(date, 1)
                            : date;

                        const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`;
                        const workingDays = getWorkingDaysInMonth(effectiveDate);
                        const freeDays = incomeConfig.mode === 'hourly' ? (incomeConfig.adjustments?.[monthKey] || 0) : 0;

                        return (
                            <TableRow key={date.toISOString()}>
                                <TableCell className="font-medium">
                                    {format(date, "MMMM")}
                                </TableCell>
                                {incomeConfig.mode === 'hourly' && (
                                    <>
                                        <TableCell className="text-right text-muted-foreground">
                                            {incomeConfig.mode === 'hourly' && incomeConfig.paymentDelay && (
                                                <span className="text-[10px] mr-1 opacity-70">
                                                    ({format(effectiveDate, "MMMM")})
                                                </span>
                                            )}
                                            {workingDays}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Input
                                                type="number"
                                                className="h-8 text-right"
                                                value={freeDays === 0 ? '' : freeDays}
                                                placeholder="0"
                                                onChange={(e) => handleFreeDaysChange(monthKey, e.target.value)}
                                            />
                                        </TableCell>
                                    </>
                                )}
                                <TableCell className="text-right font-bold">
                                    {monthlyNet.toLocaleString('cs-CZ')} Kč
                                </TableCell>
                                <TableCell className="text-right">
                                    {buckets.wants.toLocaleString('cs-CZ')} Kč
                                </TableCell>
                                <TableCell className="text-right">
                                    {buckets.needs.toLocaleString('cs-CZ')} Kč
                                </TableCell>
                                <TableCell className="text-right">
                                    {buckets.savings.toLocaleString('cs-CZ')} Kč
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
