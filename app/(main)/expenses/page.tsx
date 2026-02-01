"use client"

import { useState } from "react"
import { useFinanceStore } from "@/lib/store"
import { calculateMonthlyIncome, calculateBuckets, getExpensesForMonth, Transaction } from "@/lib/finance-engine"
import { MonthPicker } from "@/components/month-picker"
import { ExpensesTable, TransactionRowContent } from "@/components/expenses-table"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { FixBalanceDialog } from "@/components/fix-balance-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle, Plus, AlertTriangle } from "lucide-react"
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, defaultDropAnimationSideEffects, DropAnimation } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { Table, TableBody, TableRow } from "@/components/ui/table"

export default function ExpensesPage() {
    const { incomeConfig, transactions, updateTransaction, deleteTransaction, addTransaction } = useFinanceStore()
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

    // Drag State
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [defaultCategory, setDefaultCategory] = useState<'need' | 'want'>('need')
    const [isFixBalanceOpen, setIsFixBalanceOpen] = useState(false)

    // 1. Calculate Monthly Limits
    const monthlyIncome = calculateMonthlyIncome(incomeConfig)
    const buckets = calculateBuckets(monthlyIncome)

    // 2. Get Expenses for Selected Month (including Recurring projections)
    const monthlyTransactions = getExpensesForMonth(transactions, currentMonth)

    // 3. Split by Bucket (Needs vs Wants)
    const needsTransactions = monthlyTransactions.filter(t => t.category === 'need')
    const wantsTransactions = monthlyTransactions.filter(t => t.category === 'want')

    // 4. Calculate Spent
    const spentNeeds = needsTransactions.reduce((acc, t) => acc + t.amount, 0)
    const spentWants = wantsTransactions.reduce((acc, t) => acc + t.amount, 0)

    const remainingNeeds = buckets.needs - spentNeeds
    const remainingWants = buckets.wants - spentWants

    // 5. DND Logic
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        const transaction = monthlyTransactions.find(t => t.id === active.id);
        setActiveTransaction(transaction || null);
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        setActiveId(null);
        setActiveTransaction(null);

        if (!over) return

        const transactionId = active.id as string
        const targetBucket = over.id as 'need' | 'want'

        if (targetBucket === 'need' || targetBucket === 'want') {
            if (transactionId.startsWith('recurring_')) return;
            updateTransaction(transactionId, { category: targetBucket })
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const openAddDialog = (category: 'need' | 'want' = 'need') => {
        setEditingTransaction(null)
        setDefaultCategory(category)
        setIsDialogOpen(true)
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        if (id.startsWith('recurring_')) return;
        if (confirm("Are you sure you want to delete this expense?")) {
            deleteTransaction(id)
        }
    }

    const handleFixBalance = (sourceCategory: 'want' | 'saving') => {
        const deficit = Math.abs(remainingNeeds)
        const date = new Date()

        // 1. Create Negative Transaction for Needs to offset deficit
        // This makes Needs spent go down (or effectively covered)
        addTransaction({
            id: crypto.randomUUID(),
            amount: -deficit,
            category: 'need',
            date: date,
            description: `Offset from ${sourceCategory === 'want' ? 'Wants' : 'Savings'}`,
        })

        // 2. Create Positive Transaction for Source to use up its budget
        addTransaction({
            id: crypto.randomUUID(),
            amount: deficit,
            category: sourceCategory,
            date: date,
            description: 'Covered Needs deficit',
        })

        setIsFixBalanceOpen(false)
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                    <Button onClick={() => openAddDialog('need')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
                <MonthPicker currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
            </div>

            {/* Overview Cards for Current Selection */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Needs Card */}
                <Card className={cn("md:col-span-1 shadow-sm border-l-4", remainingNeeds < 0 ? "border-l-red-600 bg-red-50/10" : "border-l-blue-600")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Needs Budget</CardTitle>
                        {remainingNeeds < 0 ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <AlertCircle className="h-4 w-4 text-blue-600" />}
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div className={cn("text-2xl font-bold", remainingNeeds < 0 && "text-red-600")}>
                                {spentNeeds.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                                <span className="text-sm font-normal text-muted-foreground ml-2">spent</span>
                            </div>
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                of {buckets.needs.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        {remainingNeeds < 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Over budget by {Math.abs(remainingNeeds).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                            </div>
                        )}

                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", remainingNeeds < 0 ? "bg-red-600" : "bg-blue-600")}
                                style={{ width: `${Math.min(100, (spentNeeds / buckets.needs) * 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Wants Card */}
                <Card className={cn("md:col-span-1 shadow-sm border-l-4", remainingWants < 0 ? "border-l-red-600 bg-red-50/10" : "border-l-purple-600")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Wants Budget</CardTitle>
                        {remainingWants < 0 ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-purple-600" />}
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div className={cn("text-2xl font-bold", remainingWants < 0 && "text-red-600")}>
                                {spentWants.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                                <span className="text-sm font-normal text-muted-foreground ml-2">spent</span>
                            </div>
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                of {buckets.wants.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        {remainingWants < 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Over budget by {Math.abs(remainingWants).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                            </div>
                        )}

                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", remainingWants < 0 ? "bg-red-600" : "bg-purple-600")}
                                style={{ width: `${Math.min(100, (spentWants / buckets.wants) * 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split View with DND */}
            <DndContext
                id="expenses-dnd-context"
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 min-h-0 grid md:grid-cols-2 gap-6 pb-2">
                    <ExpensesTable
                        id="need"
                        title="Needs (50%)"
                        transactions={needsTransactions}
                        limit={buckets.needs}
                        spent={spentNeeds}
                        onAdd={() => openAddDialog('need')}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onFixBalance={() => setIsFixBalanceOpen(true)}
                    />
                    <ExpensesTable
                        id="want"
                        title="Wants (30%)"
                        transactions={wantsTransactions}
                        limit={buckets.wants}
                        spent={spentWants}
                        onAdd={() => openAddDialog('want')}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Drag Overlay Portal */}
                {typeof window !== 'undefined' && createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeTransaction ? (
                            <div className="bg-background border rounded-md shadow-2xl opacity-90 p-2 w-[600px]">
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-0 hover:bg-transparent">
                                            <TransactionRowContent
                                                transaction={activeTransaction}
                                                isOverlay={true}
                                            />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Unified Dialog */}
            <AddExpenseDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                existingTransaction={editingTransaction}
                defaultCategory={defaultCategory}
            >
                <div className="hidden" />
            </AddExpenseDialog>

            <FixBalanceDialog
                isOpen={isFixBalanceOpen}
                onClose={() => setIsFixBalanceOpen(false)}
                deficitAmount={remainingNeeds}
                wantsBalance={remainingWants}
                savingsBalance={buckets.savings} // Savings doesn't have "spent" tracked simply here yet, simplified
                onConfirm={handleFixBalance}
            />
        </div>
    )
}
