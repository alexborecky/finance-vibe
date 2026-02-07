import * as React from "react"
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
import { calculateMonthlyIncomeDetails, getWorkingDaysInMonth, MonthlyIncomeDetails } from "@/lib/finance-engine"
import { format, subMonths } from "date-fns"
import { Info, Settings2, Pencil } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { EditExtraIncomeModal } from "./edit-extra-income-modal"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth/auth-context"

export function IncomeProjectionTable({ className }: { className?: string }) {
    const { incomeConfig, setIncomeConfig, transactions, preferences, setPreferences } = useFinanceStore()
    const { user } = useAuth()
    const [editingMonth, setEditingMonth] = useState<{ date: Date } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)



    // Default configuration
    const defaultVisibleColumns = {
        needs: false,
        safeToSpend: false,
        savings: false
    }

    const defaultColumnWidths: Record<string, number> = {
        month: 120,
        billableDays: 100,
        freeDays: 60, // Reduced from typical auto width (approx 1/4 size visually)
        grossIncome: 120,
        extraIncome: 120,
        netIncome: 120,
        safeToSpend: 120,
        needs: 120,
        savings: 120
    }

    // State - Initialize with defaults or store preferences
    // We use a local state to avoid rapid updates to the store during resizing/toggling
    // but we sync back to the store
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(defaultVisibleColumns)
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from store on mount or when preferences change (if not yet modified locally)
    React.useEffect(() => {
        if (preferences?.visibleColumns) {
            setVisibleColumns(prev => ({ ...prev, ...preferences.visibleColumns }))
        }
        if (preferences?.columnWidths) {
            setColumnWidths(prev => ({ ...prev, ...preferences.columnWidths }))
        }
        setIsLoaded(true)
    }, [preferences])

    // Save to store whenever state changes
    // Debounce this in a real app, but for now direct update is okay if not too frequent
    // Resizing triggers many updates, so we should probably only save on mouse up.
    // However, the resizing logic updates local state.

    const savePreferences = (newVisibleColumns: Record<string, boolean>, newColumnWidths: Record<string, number>) => {
        setPreferences({
            visibleColumns: newVisibleColumns,
            columnWidths: newColumnWidths
        }, user?.id)
    }

    const handleColumnToggle = (column: string, checked: boolean) => {
        const newVisible = { ...visibleColumns, [column]: checked }
        setVisibleColumns(newVisible)
        savePreferences(newVisible, columnWidths)
    }


    // Resizing Logic
    const [resizingColumn, setResizingColumn] = useState<string | null>(null)
    const resizingRef = React.useRef<{ startX: number, startWidth: number } | null>(null)

    const startResizing = (e: React.MouseEvent, columnKey: string) => {
        e.preventDefault()
        setResizingColumn(columnKey)
        resizingRef.current = {
            startX: e.clientX,
            startWidth: columnWidths[columnKey] || 100
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!resizingRef.current) return
            const diff = moveEvent.clientX - resizingRef.current.startX
            const newWidth = Math.max(50, resizingRef.current.startWidth + diff) // Min width 50px

            setColumnWidths(prev => ({
                ...prev,
                [columnKey]: newWidth
            }))
        }

        const handleMouseUp = () => {
            setResizingColumn(null)
            resizingRef.current = null
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            // Save final width to store
            // We need to get the latest columnWidths state, but inside this closure 
            // the state might be stale if we relied on the closure scope. 
            // However, we updated the state via functional update. 
            // To save, we can just call savePreferences with the current state in a useEffect 
            // or here if we have access. 
            // Actually, best to trigger save here.
            // But we don't have the "final" new width readily available without ref or state.
            // Let's use a ref for the latest widths to save them.
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    // Effect to save widths after resizing interactions if needed, 
    // or we can just rely on the effect to save? 
    // The previous implementation saved on every change to localStorage. 
    // Updating the store on every pixel drag (via setPreferences which might call DB) is bad.
    // So we should only call setPreferences on mouseUp.
    // But `handleMouseUp` doesn't know the final width.

    // Alternative: Use a debounce for saving preferences.
    React.useEffect(() => {
        if (!isLoaded) return

        const timer = setTimeout(() => {
            savePreferences(visibleColumns, columnWidths)
        }, 1000) // 1 second debounce

        return () => clearTimeout(timer)
    }, [visibleColumns, columnWidths])

    const currentYear = new Date().getFullYear()
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1)), [currentYear])

    const monthlyData = useMemo(() => {
        return months.map(date => calculateMonthlyIncomeDetails(incomeConfig, transactions, date))
    }, [incomeConfig, transactions, months])

    const hasExtraIncome = useMemo(() => {
        return monthlyData.some(m => m.extraIncomeTotal > 0)
    }, [monthlyData])

    const handleFreeDaysChange = (monthKey: string, value: string) => {
        if (incomeConfig.mode !== 'hourly') return;

        const newAdjustments = {
            ...(incomeConfig.adjustments || {}),
            [monthKey]: Number(value) || 0
        };

        setIncomeConfig({
            ...incomeConfig,
            adjustments: newAdjustments
        }, user?.id);
    };

    const handleEditExtraIncome = (date: Date) => {
        setEditingMonth({ date })
        setIsModalOpen(true)
    }

    // Helper to render resizable header
    const ResizableHeader = ({ id, children, align = "right" }: { id: string, children: React.ReactNode, align?: "left" | "right" | "center" }) => (
        <TableHead
            className={cn(
                "relative group select-none sticky top-0 bg-background/95 backdrop-blur-sm z-10",
                align === "right" && "text-right",
                align === "center" && "text-center"
            )}
            style={{ width: columnWidths[id], minWidth: columnWidths[id] }}
        >
            <div className={cn("flex items-center", align === "right" ? "justify-end" : (align === "center" ? "justify-center" : "justify-start"))}>
                {children}
            </div>
            <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 group-hover:bg-primary/20 transition-colors"
                onMouseDown={(e) => startResizing(e, id)}
            />
        </TableHead>
    )

    return (
        <div className={cn("space-y-4 flex flex-col h-full", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Yearly Projection</h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.needs}
                            onCheckedChange={(checked) => handleColumnToggle('needs', !!checked)}
                        >
                            Needs
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.safeToSpend}
                            onCheckedChange={(checked) => handleColumnToggle('safeToSpend', !!checked)}
                        >
                            Safe to spend
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.savings}
                            onCheckedChange={(checked) => handleColumnToggle('savings', !!checked)}
                        >
                            Savings
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-1 min-h-0 rounded-md border bg-card text-card-foreground shadow-sm">
                <Table className="w-full" containerClassName="h-full" style={{ tableLayout: "fixed" }}>
                    <TableHeader>
                        <TableRow>
                            <ResizableHeader id="month" align="left">Month</ResizableHeader>
                            {incomeConfig.mode === 'hourly' && (
                                <>
                                    <ResizableHeader id="billableDays">Billable days</ResizableHeader>
                                    <ResizableHeader id="freeDays">Free days</ResizableHeader>
                                </>
                            )}
                            <ResizableHeader id="grossIncome">Gross Income</ResizableHeader>
                            {hasExtraIncome && (
                                <ResizableHeader id="extraIncome">Extra Income</ResizableHeader>
                            )}
                            <ResizableHeader id="netIncome">Net Income</ResizableHeader>

                            {visibleColumns.safeToSpend && (
                                <ResizableHeader id="safeToSpend">
                                    <span className="text-purple-600 dark:text-purple-400">Safe to spend</span>
                                </ResizableHeader>
                            )}
                            {visibleColumns.needs && (
                                <ResizableHeader id="needs">
                                    <span className="text-blue-600 dark:text-blue-400">Needs</span>
                                </ResizableHeader>
                            )}
                            {visibleColumns.savings && (
                                <ResizableHeader id="savings">
                                    <span className="text-emerald-600 dark:text-emerald-400">Savings</span>
                                </ResizableHeader>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {monthlyData.map((data) => {
                            const date = data.date;
                            const effectiveDate = (incomeConfig.mode === 'hourly' && incomeConfig.paymentDelay)
                                ? subMonths(date, 1)
                                : date;

                            const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`;

                            return (
                                <React.Fragment key={date.toISOString()}>
                                    <TableRow>
                                        <TableCell className="font-medium truncate">
                                            {format(date, "MMMM")}
                                        </TableCell>
                                        {incomeConfig.mode === 'hourly' && (
                                            <>
                                                <TableCell className="text-right text-muted-foreground truncate">
                                                    {incomeConfig.mode === 'hourly' && incomeConfig.paymentDelay && (
                                                        <span className="text-[10px] mr-1 opacity-70">
                                                            ({format(effectiveDate, "MMMM")})
                                                        </span>
                                                    )}
                                                    {data.billableDays}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        className="h-8 text-right w-full"
                                                        value={data.freeDays === 0 ? '' : data.freeDays}
                                                        placeholder="0"
                                                        onChange={(e) => handleFreeDaysChange(monthKey, e.target.value)}
                                                    />
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-right truncate">
                                            {data.grossIncome.toLocaleString('cs-CZ')} Kč
                                        </TableCell>
                                        {hasExtraIncome && (
                                            <TableCell className="text-right truncate">
                                                {data.extraIncomeTotal > 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span>{data.extraIncomeTotal.toLocaleString('cs-CZ')} Kč</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                            onClick={() => handleEditExtraIncome(date)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right font-bold truncate">
                                            {data.netIncome.toLocaleString('cs-CZ')} Kč
                                        </TableCell>

                                        {visibleColumns.safeToSpend && (
                                            <TableCell className="text-right truncate">
                                                {data.buckets.wants.toLocaleString('cs-CZ')} Kč
                                            </TableCell>
                                        )}
                                        {visibleColumns.needs && (
                                            <TableCell className="text-right truncate">
                                                {data.buckets.needs.toLocaleString('cs-CZ')} Kč
                                            </TableCell>
                                        )}
                                        {visibleColumns.savings && (
                                            <TableCell className="text-right truncate">
                                                {data.buckets.savings.toLocaleString('cs-CZ')} Kč
                                            </TableCell>
                                        )}
                                    </TableRow>

                                </React.Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {editingMonth && (
                <EditExtraIncomeModal
                    date={editingMonth.date}
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
            )}
        </div>
    )
}
