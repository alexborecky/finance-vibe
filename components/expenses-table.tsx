"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Trash2, Pencil, RefreshCw, AlertTriangle, Plus, Info } from "lucide-react"
import { Transaction } from "@/lib/finance-engine"
import { format } from "date-fns"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExpensesTableProps {
    id: 'need' | 'want';
    title: string;
    transactions: Transaction[];
    limit: number;
    spent: number;
    onAdd?: () => void;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    onFixBalance?: () => void;
}

export function ExpensesTable({ id, title, transactions, limit, spent, onAdd, onEdit, onDelete, onFixBalance }: ExpensesTableProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    })

    const remaining = limit - spent
    const progress = Math.min(100, (spent / limit) * 100)
    const remainingPercentage = (remaining / limit) * 100

    // Logic for Colors
    let statusColor = "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200" // Default Good
    let isWarning = false
    let isError = false

    if (remaining < 0) {
        statusColor = "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200"
        isError = true
    } else if (remainingPercentage <= 10) {
        statusColor = "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200"
        isWarning = true
    }

    const borderColor = id === 'need' ? 'border-blue-200 dark:border-blue-800' : 'border-purple-200 dark:border-purple-800'
    const bgColor = id === 'need' ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-purple-50/50 dark:bg-purple-950/20'
    const activeColor = id === 'need' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-purple-100 dark:bg-purple-900/40'

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col border rounded-lg transition-colors overflow-hidden h-full",
                borderColor,
                bgColor,
                isOver && activeColor,
                // Removed ring style as requested
            )}
        >
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                                {title}
                            </h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="p-1 rounded-full hover:bg-muted cursor-help transition-colors">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-[200px] text-xs">
                                            {id === 'need'
                                                ? "Needs budget is calculated as 50% of your total net income for this month."
                                                : "Wants budget is calculated as 30% of your total net income for this month."}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Badge variant="outline" className={cn("font-normal flex items-center gap-1", statusColor)}>
                                {isWarning && !isError && <AlertTriangle className="h-3 w-3" />}
                                {isError && <AlertTriangle className="h-3 w-3" />}
                                {remaining < 0
                                    ? `${Math.abs(remaining).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })} over`
                                    : `${remaining.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })} left`
                                }
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            {onFixBalance && remaining < 0 && id === 'need' && (
                                <Button size="sm" variant="destructive" onClick={onFixBalance} className="h-8 px-2 text-xs">
                                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Fix
                                </Button>
                            )}
                            {onAdd && (
                                <Button size="sm" variant="outline" onClick={onAdd} className="h-8 px-2 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-4 mb-1">
                        <div className="text-sm font-bold">
                            {spent.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                            <span className="text-xs font-normal text-muted-foreground ml-1">spent</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            of {limit.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all",
                                isError ? "bg-red-500" : (isWarning ? "bg-orange-500" : (id === 'need' ? 'bg-blue-500' : 'bg-purple-500'))
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-background/30">
                <Table containerClassName="h-full">
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <TableRow className="hover:bg-transparent border-b-0">
                            <TableHead className="w-[30px] border-b"></TableHead>
                            <TableHead className="border-b">Description</TableHead>
                            <TableHead className="border-b">Date</TableHead>
                            <TableHead className="text-right border-b">Amount</TableHead>
                            <TableHead className="w-[70px] border-b"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No expenses in this bucket. Drag items here or add new.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => (
                                <DraggableRow
                                    key={t.id}
                                    transaction={t}
                                    onEdit={() => onEdit?.(t)}
                                    onDelete={() => onDelete?.(t.id)}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function DraggableRow({ transaction, onEdit, onDelete }: { transaction: Transaction, onEdit: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: transaction.id,
        data: { transaction }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                "group",
                isDragging && "opacity-0" // Hide original when dragging
            )}
        >
            <TransactionRowContent
                transaction={transaction}
                dragHandleProps={{ ...listeners, ...attributes }}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </TableRow>
    )
}

// Exported for DragOverlay
export function TransactionRowContent({
    transaction,
    dragHandleProps,
    onEdit,
    onDelete,
    isOverlay = false
}: {
    transaction: Transaction,
    dragHandleProps?: any,
    onEdit?: () => void,
    onDelete?: () => void,
    isOverlay?: boolean
}) {
    const isVirtual = transaction.id.startsWith('recurring_');

    return (
        <>
            <TableCell className={cn(isOverlay && "w-[50px]")}>
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </div>
            </TableCell>
            <TableCell className={cn("font-medium", isOverlay && "w-[200px]")}>
                <div className="flex flex-col">
                    <span>{(transaction.description || "Expense").replace(/ \(Recurring\)+$/g, '')}</span>
                    {transaction.isRecurring && (
                        <span className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                            <RefreshCw className="h-3 w-3 mr-1" /> Recurring
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className={cn("text-muted-foreground", isOverlay && "w-[150px]")}>{format(new Date(transaction.date), 'MMM d')}</TableCell>
            <TableCell className={cn("text-right font-mono", isOverlay && "w-[100px]")}>
                {transaction.amount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
            </TableCell>
            <TableCell className={cn(isOverlay && "w-[100px]")}>
                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    {!isOverlay && (
                        <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onEdit}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                    {isVirtual && (
                        <span className="text-[10px] text-muted-foreground italic mr-2">Auto</span>
                    )}
                </div>
            </TableCell>
        </>
    )
}
