"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Pencil, Calendar as CalendarIcon, Wallet, PiggyBank, HandCoins } from "lucide-react"
import { useState, useEffect } from "react"
import { format, differenceInMonths, addMonths } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Button } from "@/components/ui/button"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { useFinanceStore } from "@/lib/store"
import { FinancialGoal } from "@/lib/finance-engine"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target amount must be positive",
    }),
    currentAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Current amount must be non-negative",
    }),
    type: z.enum(['short-term', 'long-term']),
    targetDate: z.date().optional(),
    savingStrategy: z.enum(['recurring-wants', 'lower-savings', 'manual']).optional(),
    createTransaction: z.boolean().default(false),
})

interface AddGoalDialogProps {
    existingGoal?: FinancialGoal | null;
    children?: React.ReactNode;
}

export function AddGoalDialog({ existingGoal, children }: AddGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [targetDateEnabled, setTargetDateEnabled] = useState(false)
    const { addGoal, editGoal, addTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            targetAmount: "",
            currentAmount: "0",
            type: "short-term",
        },
    })

    useEffect(() => {
        if (open) {
            if (existingGoal) {
                form.reset({
                    name: existingGoal.name,
                    targetAmount: String(existingGoal.targetAmount),
                    currentAmount: String(existingGoal.currentAmount),
                    type: existingGoal.type,
                    targetDate: existingGoal.targetDate ? new Date(existingGoal.targetDate) : undefined,
                    savingStrategy: existingGoal.savingStrategy,
                    createTransaction: false,
                })
                setTargetDateEnabled(!!existingGoal.targetDate)
            } else {
                form.reset({
                    name: "",
                    targetAmount: "",
                    currentAmount: "0",
                    type: "short-term",
                    targetDate: undefined,
                    savingStrategy: undefined,
                    createTransaction: false,
                })
                setTargetDateEnabled(false)
            }
        }
    }, [open, existingGoal, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (existingGoal) {
            editGoal(existingGoal.id, {
                name: values.name,
                targetAmount: Number(values.targetAmount),
                currentAmount: Number(values.currentAmount),
                type: values.type as 'short-term' | 'long-term',
                targetDate: targetDateEnabled ? values.targetDate : undefined,
                savingStrategy: targetDateEnabled ? values.savingStrategy : undefined,
            })
        } else {
            const goalId = crypto.randomUUID()
            addGoal({
                id: goalId,
                name: values.name,
                targetAmount: Number(values.targetAmount),
                currentAmount: Number(values.currentAmount),
                type: values.type as 'short-term' | 'long-term',
                targetDate: targetDateEnabled ? values.targetDate : undefined,
                savingStrategy: targetDateEnabled ? values.savingStrategy : undefined,
            })
        }

        // Handle Automated Transactions
        if (targetDateEnabled && values.targetDate && values.savingStrategy && values.savingStrategy !== 'manual') {
            // Calculate monthly amount
            const remaining = Number(values.targetAmount) - Number(values.currentAmount)
            const months = Math.max(1, differenceInMonths(values.targetDate, new Date()))
            const monthlyAmount = Math.ceil(remaining / months)

            if (monthlyAmount > 0) {
                const category = values.savingStrategy === 'recurring-wants' ? 'want' : 'saving'

                addTransaction({
                    id: crypto.randomUUID(),
                    amount: monthlyAmount,
                    category: category,
                    date: new Date(),
                    description: `Saving for ${values.name}`,
                    isRecurring: true
                })
            }
        }

        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                    <DialogDescription>
                        {existingGoal ? "Update your financial goal details." : "Define a new target to save towards."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Type</FormLabel>
                                    <FormControl>
                                        <Tabs
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="short-term">Short Term (Wants)</TabsTrigger>
                                                <TabsTrigger value="long-term">Long Term (Savings)</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="New Laptop, Vacation..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target (CZK)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="50000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Saved (CZK)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Target Date Section */}
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                            <div className="flex items-center justify-between">
                                <FormLabel className="flex flex-col gap-1">
                                    <span>Set a Target Date?</span>
                                    <span className="font-normal text-xs text-muted-foreground">Unlock smart saving recommendations</span>
                                </FormLabel>
                                <Switch
                                    checked={targetDateEnabled}
                                    onCheckedChange={(checked) => {
                                        setTargetDateEnabled(checked)
                                        if (!checked) {
                                            form.setValue('targetDate', undefined)
                                            form.setValue('savingStrategy', undefined)
                                        }
                                    }}
                                />
                            </div>

                            {targetDateEnabled && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <FormField
                                        control={form.control}
                                        name="targetDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Target Deadline</FormLabel>
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
                                                                date < new Date()
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="savingStrategy"
                                        render={({ field }) => {
                                            const targetAmount = Number(form.watch('targetAmount')) || 0
                                            const currentAmount = Number(form.watch('currentAmount')) || 0
                                            const targetDate = form.watch('targetDate')

                                            let monthlyAmount = 0
                                            let isShortTerm = true

                                            if (targetDate) {
                                                const months = Math.max(1, differenceInMonths(targetDate, new Date()))
                                                monthlyAmount = Math.ceil((targetAmount - currentAmount) / months)
                                                isShortTerm = months <= 12

                                                // Auto-select recommended strategy if not set
                                                if (!field.value) {
                                                    // Avoid infinite loop by checking if value is already set
                                                    // Effectively done by only rendering if enabled. 
                                                    // But we should set default. useEffect? Or just let user pick.
                                                    // Let's suggest via UI badges.
                                                }
                                            }

                                            return (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>How do you want to save?</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            {/* Strategy A: Recurring Expense (Wants) */}
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="recurring-wants" id="s1" className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel htmlFor="s1" className="flex flex-col w-full cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary relative overflow-hidden">
                                                                    <div className="flex w-full items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2 font-semibold">
                                                                            <Wallet className="h-4 w-4 text-purple-600" />
                                                                            Add recurring Wants expense
                                                                        </div>
                                                                        {isShortTerm && (
                                                                            <Badge variant="secondary" className="bg-green-100 text-green-700">Recommended</Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground w-3/4">
                                                                        Automatically add <strong>{monthlyAmount.toLocaleString('cs-CZ')} Kč/mo</strong> to your wants budget. Ideal for short-term goals.
                                                                    </div>
                                                                </FormLabel>
                                                            </FormItem>

                                                            {/* Strategy B: Lower Savings */}
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="lower-savings" id="s2" className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel htmlFor="s2" className="flex flex-col w-full cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary relative overflow-hidden">
                                                                    <div className="flex w-full items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2 font-semibold">
                                                                            <PiggyBank className="h-4 w-4 text-emerald-600" />
                                                                            Use Savings Fund
                                                                        </div>
                                                                        {!isShortTerm && (
                                                                            <Badge variant="secondary" className="bg-green-100 text-green-700">Recommended</Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground w-3/4">
                                                                        Reserve <strong>{monthlyAmount.toLocaleString('cs-CZ')} Kč/mo</strong> from your 20% savings bucket. Best for long-term safety.
                                                                    </div>
                                                                </FormLabel>
                                                            </FormItem>

                                                            {/* Strategy C: Manual */}
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="manual" id="s3" className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel htmlFor="s3" className="flex flex-col w-full cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                                                    <div className="flex w-full items-center justify-between mb-1">
                                                                        <div className="flex items-center gap-2 font-semibold">
                                                                            <HandCoins className="h-4 w-4 text-slate-600" />
                                                                            I'll manage myself
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        No automatic transactions. You handle the transfers.
                                                                    </div>
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit">{existingGoal ? "Save Changes" : "Create Goal"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
