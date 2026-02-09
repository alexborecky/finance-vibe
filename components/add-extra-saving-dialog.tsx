"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinanceStore } from "@/lib/store"
import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    description: z.string().min(1, "Description is required"),
    date: z.date(),
    source: z.enum(["one-time", "needs", "wants"]),
})

interface AddExtraSavingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultDate?: Date
}

export function AddExtraSavingDialog({
    open,
    onOpenChange,
    defaultDate,
}: AddExtraSavingDialogProps) {
    const { user } = useAuth()
    const { addTransaction } = useFinanceStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            description: "",
            date: defaultDate || new Date(),
            source: "one-time",
        },
    })

    const source = form.watch("source")

    useEffect(() => {
        if (open) {
            form.reset({
                amount: "",
                description: "",
                date: defaultDate || new Date(),
                source: "one-time",
            })
        }
    }, [open, defaultDate, form])

    // Update description hint based on source
    useEffect(() => {
        if (source === "needs") {
            form.setValue("description", "Saved from Needs")
        } else if (source === "wants") {
            form.setValue("description", "Saved from Wants")
        } else if (source === "one-time" && (form.getValues("description") === "Saved from Needs" || form.getValues("description") === "Saved from Wants")) {
            form.setValue("description", "")
        }
    }, [source, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return

        addTransaction({
            amount: Number(values.amount),
            category: 'saving',
            date: values.date,
            description: values.description,
        }, user.id)

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Extra Saving</DialogTitle>
                    <DialogDescription>
                        Save more money towards your goals.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source ({field.value})</FormLabel>
                                    <FormControl>
                                        <Tabs
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="one-time">One-time</TabsTrigger>
                                                <TabsTrigger value="needs">Needs</TabsTrigger>
                                                <TabsTrigger value="wants">Wants</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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
                                                        date > new Date() || date < new Date("1900-01-01")
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="0"
                                                    {...field}
                                                    className="pr-12 text-right"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Kč</div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Gift, Bonus..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="w-full">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
