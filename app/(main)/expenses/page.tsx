"use client"

import { useState, useEffect } from "react"
import { useFinanceStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { checkProjectedSolvency, calculateMonthlyIncome, calculateBuckets, getExpensesForMonth, Transaction, calculateMonthlyIncomeDetails } from "@/lib/finance-engine"
import { MonthPicker } from "@/components/month-picker"
import { ExpensesTable, TransactionRowContent } from "@/components/expenses-table"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { FixBalanceDialog } from "@/components/fix-balance-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle, Plus, AlertTriangle, Calendar } from "lucide-react"
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, defaultDropAnimationSideEffects, DropAnimation } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Table, TableBody, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth/auth-context"

export default function ExpensesPage() {
    const { user } = useAuth()
    const { incomeConfig, transactions, updateTransaction, deleteTransaction, addTransaction, goals } = useFinanceStore()
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [isMounted, setIsMounted] = useState(false)

    // Handle hydration mismatch for Date
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Check for future negative balances
    // Check for future negative balances
    const { hasAlert, firstFailingMonth, failingMonths } = checkProjectedSolvency(incomeConfig, transactions, goals, 12)

    // Drag State
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [defaultCategory, setDefaultCategory] = useState<'need' | 'want'>('need')
    const [isFixBalanceOpen, setIsFixBalanceOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

    // 1. Calculate Monthly Limits based on CURRENT month selection
    // Instead of calculateMonthlyIncome(incomeConfig), we use calculateMonthlyIncomeDetails
    // to include extra income and adjustments for the specific month.
    const monthDetails = calculateMonthlyIncomeDetails(incomeConfig, transactions, currentMonth)
    const buckets = monthDetails.buckets

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

    const handleDelete = async (id: string) => {
        setExpenseToDelete(id)
    }

    const confirmDelete = async () => {
        if (!expenseToDelete) return
        const id = expenseToDelete
        const isVirtual = id.startsWith('recurring_')

        if (isVirtual) {
            if (!user) return
            const originalId = id.split('_')[1]
            const transaction = monthlyTransactions.find(t => t.id === id)
            addTransaction({
                amount: 0,
                category: transaction?.category || 'need',
                date: currentMonth,
                description: 'Deleted Recurring Instance',
                isRecurring: false,
                recurringSourceId: originalId,
            }, user.id)
        } else {
            deleteTransaction(id)
        }
        setExpenseToDelete(null)
    }
    const handleFixBalance = (sourceCategory: 'want' | 'saving') => {
        const deficit = Math.abs(remainingNeeds)
        const date = new Date(currentMonth)

        // 1. Create Negative Transaction for Needs to offset deficit
        // This makes Needs spent go down (or effectively covered)
        if (user) {
            addTransaction({
                amount: -deficit,
                category: 'need',
                date: date,
                description: `Offset from ${sourceCategory === 'want' ? 'Wants' : 'Savings'}`,
            }, user.id)

            // 2. Create Positive Transaction for Source to use up its budget
            addTransaction({
                amount: deficit,
                category: sourceCategory,
                date: date,
                description: 'Covered Needs deficit',
            }, user.id)
        }

        setIsFixBalanceOpen(false)
    }



    if (!isMounted) {
        return <div className="p-8">Loading expenses...</div>
    }

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>

                    </div>
                    <Button onClick={() => openAddDialog('need')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                        className="h-[32px] px-3 font-semibold text-sm rounded-md gap-2 bg-transparent shadow-none"
                        disabled={format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
                    >
                        <Calendar className="h-4 w-4" />
                        Current month
                    </Button>
                    <MonthPicker currentMonth={currentMonth} onMonthChange={setCurrentMonth} failingMonths={failingMonths} />
                </div>
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
                        title="Needs"
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
                        title="Wants"
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

            <ConfirmDialog
                open={!!expenseToDelete}
                onOpenChange={(open) => !open && setExpenseToDelete(null)}
                title="Delete Expense"
                description={`Are you sure you want to delete this ${expenseToDelete?.startsWith('recurring_') ? 'recurring ' : ''}expense${expenseToDelete?.startsWith('recurring_') ? ' for this month' : ''}?`}
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    )
}
