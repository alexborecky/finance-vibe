"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, subMonths } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useFinanceStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Transaction } from "@/lib/finance-engine"
import { useAuth } from "@/lib/auth/auth-context"

// Enhanced schema with recurring logic
const formSchema = z.object({
    category: z.enum(['need', 'want', 'saving']),
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    date: z.date(),
    isRecurring: z.boolean().default(false).optional(),
    recurringEndDate: z.date().optional(),
})

interface AddExpenseDialogProps {
    defaultCategory?: 'need' | 'want';
    defaultDate?: Date;
    defaultAmount?: string;
    existingTransaction?: Transaction | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export function AddExpenseDialog({
    defaultCategory = 'need',
    defaultDate,
    defaultAmount,
    existingTransaction,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    children
}: AddExpenseDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isRecurringConfirmOpen, setIsRecurringConfirmOpen] = useState(false)
    const [pendingSubmission, setPendingSubmission] = useState<z.infer<typeof formSchema> | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen || setInternalOpen;

    const { user } = useAuth()
    const { addTransaction, updateTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: defaultCategory,
            description: "",
            amount: defaultAmount || "",
            date: defaultDate || new Date(),
            isRecurring: false,
        },
    })

    // Reset form when opening/changing transaction
    useEffect(() => {
        if (isOpen) {
            setError(null)
            if (existingTransaction) {
                form.reset({
                    category: existingTransaction.category as any,
                    description: (existingTransaction.description || "").replace(' (Recurring)', ''),
                    amount: String(existingTransaction.amount),
                    date: new Date(existingTransaction.date),
                    isRecurring: existingTransaction.isRecurring || false,
                    recurringEndDate: existingTransaction.recurringEndDate ? new Date(existingTransaction.recurringEndDate) : undefined,
                })
            } else {
                form.reset({
                    category: defaultCategory,
                    description: "",
                    amount: defaultAmount || "",
                    date: defaultDate || new Date(),
                    isRecurring: false,
                })
            }
        }
    }, [isOpen, existingTransaction, defaultCategory, defaultDate, defaultAmount, form])

    const category = form.watch("category")

    async function onSubmit(values: z.infer<typeof formSchema>, isContinue: boolean = false) {
        if (!user) {
            setError("You must be logged in to add expenses.")
            return
        }

        const isVirtual = existingTransaction?.id.startsWith('recurring_')
        const originalId = isVirtual
            ? existingTransaction!.id.split('_')[1]
            : existingTransaction?.id

        const isRecurringEdit = isVirtual || existingTransaction?.isRecurring

        if (existingTransaction && isRecurringEdit) {
            // Ask for propagation using Custom Dialog
            setPendingSubmission(values)
            setIsRecurringConfirmOpen(true)
            return
        }

        await processTransaction(values, 'none', isContinue)
    }

    async function processTransaction(
        values: z.infer<typeof formSchema>,
        propagationMode: 'single' | 'future' | 'none' = 'none',
        isContinue: boolean = false
    ) {
        if (!user) {
            setError("User session not found.")
            return;
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const isVirtual = existingTransaction?.id.startsWith('recurring_')
            const originalId = isVirtual
                ? existingTransaction!.id.split('_')[1]
                : existingTransaction?.id

            let result;

            if (propagationMode === 'future') {
                // ... existing logic ...
                if (isVirtual) {
                    await updateTransaction(originalId!, { recurringEndDate: subMonths(values.date, 1) })
                    result = await addTransaction({
                        amount: Number(values.amount),
                        description: values.description,
                        category: values.category as any,
                        date: values.date,
                        isRecurring: true,
                        recurringEndDate: values.recurringEndDate,
                    }, user.id)
                } else {
                    await updateTransaction(existingTransaction!.id, {
                        amount: Number(values.amount),
                        description: values.description,
                        category: values.category as any,
                        date: values.date,
                        isRecurring: true,
                        recurringEndDate: values.recurringEndDate,
                    })
                }
            } else if (propagationMode === 'single') {
                await addTransaction({
                    amount: Number(values.amount),
                    description: values.description,
                    category: values.category as any,
                    date: values.date,
                    isRecurring: false,
                    recurringSourceId: originalId,
                }, user.id)
            } else {
                if (existingTransaction) {
                    await updateTransaction(existingTransaction.id, {
                        amount: Number(values.amount),
                        description: values.description,
                        category: values.category as any,
                        date: values.date,
                        isRecurring: values.isRecurring,
                        recurringEndDate: values.recurringEndDate,
                    })
                } else {
                    console.log("Adding new transaction...");
                    result = await addTransaction({
                        amount: Number(values.amount),
                        description: values.description,
                        category: values.category as any,
                        date: values.date,
                        isRecurring: values.isRecurring ?? false,
                        recurringEndDate: values.recurringEndDate,
                    }, user.id)
                    console.log("Transaction added successfully", result);
                }
            }

            if (!isContinue) {
                setIsOpen(false)
                form.reset()
            } else {
                // Simplified reset strategy: Reset to defaults, then restore sticky fields
                form.reset({
                    category: values.category,
                    description: "",
                    amount: "",
                    date: values.date, // Keep date
                    isRecurring: values.isRecurring ?? false, // Keep recurring check
                    recurringEndDate: values.recurringEndDate // Keep end date if set
                });
            }
            setIsRecurringConfirmOpen(false)
            setPendingSubmission(null)
        } catch (error: any) {
            console.error("Failed to process transaction (CAUGHT):", error);
            setError(error.message || "Failed to save transaction. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingTransaction ? "Edit Expense" : "Add Expense"}</DialogTitle>
                    <DialogDescription>
                        {existingTransaction ? "Update expense details." : "Record a new expense."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-4">
                        {/* Category Segmented Control */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Tabs
                                            value={field.value !== 'saving' ? field.value : 'need'}
                                            onValueChange={field.onChange}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="need">Need (50%)</TabsTrigger>
                                                <TabsTrigger value="want">Want (30%)</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lunch, Rent, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (CZK)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="150" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Recurring Checkbox - Only for Needs (or if editing a recurring item) */}
                        {(category === 'need' || form.getValues('isRecurring')) && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isRecurring"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Recurring Expense
                                                </FormLabel>
                                                <DialogDescription>
                                                    This item will repeat next month (e.g. Rent, Utilities).
                                                </DialogDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {form.watch('isRecurring') && (
                                    <FormField
                                        control={form.control}
                                        name="recurringEndDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>End Date (Optional)</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>No end date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            {!existingTransaction && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={form.handleSubmit((values) => onSubmit(values, true))}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save and add another"}
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : (existingTransaction ? "Save Changes" : "Save Expense")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

            <AlertDialog open={isRecurringConfirmOpen} onOpenChange={setIsRecurringConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Recurring Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            This is a recurring expense. How would you like to apply your changes?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
                        <div className="flex flex-col gap-2 w-full">
                            <Button onClick={() => pendingSubmission && processTransaction(pendingSubmission, 'future')}>
                                Update this and all future payments
                            </Button>
                            <Button variant="secondary" onClick={() => pendingSubmission && processTransaction(pendingSubmission, 'single')}>
                                Update only this month's payment
                            </Button>
                            <Button variant="ghost" onClick={() => setIsRecurringConfirmOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
