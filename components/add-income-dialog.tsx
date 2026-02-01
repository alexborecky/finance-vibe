"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useFinanceStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Transaction } from "@/lib/finance-engine"

const formSchema = z.object({
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    date: z.date(),
})

interface AddIncomeDialogProps {
    existingTransaction?: Transaction | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export function AddIncomeDialog({
    existingTransaction,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    children
}: AddIncomeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen || setInternalOpen;

    const { addTransaction, updateTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: "",
            date: new Date(),
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (existingTransaction) {
                form.reset({
                    description: existingTransaction.description || "",
                    amount: String(existingTransaction.amount),
                    date: new Date(existingTransaction.date),
                })
            } else {
                form.reset({
                    description: "",
                    amount: "",
                    date: new Date(),
                })
            }
        }
    }, [isOpen, existingTransaction, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (existingTransaction) {
            updateTransaction(existingTransaction.id, {
                amount: Number(values.amount),
                description: values.description,
                category: 'income',
                date: values.date,
            })
        } else {
            addTransaction({
                id: crypto.randomUUID(),
                amount: Number(values.amount),
                description: values.description,
                category: 'income',
                date: values.date,
            })
        }
        setIsOpen(false)
        form.reset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button><Plus className="mr-2 h-4 w-4" /> Add Income</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingTransaction ? "Edit Income" : "Add One-time Income"}</DialogTitle>
                    <DialogDescription>
                        {existingTransaction ? "Update income details." : "Record a gift, bonus, or other one-time income."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bonus, Gift, etc." {...field} />
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
                                        <Input placeholder="5000" {...field} />
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

                        <DialogFooter>
                            <Button type="submit">{existingTransaction ? "Save Changes" : "Save Income"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
