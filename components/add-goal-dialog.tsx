"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Pencil } from "lucide-react"
import { useState, useEffect } from "react"

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
})

interface AddGoalDialogProps {
    existingGoal?: FinancialGoal | null;
    children?: React.ReactNode;
}

export function AddGoalDialog({ existingGoal, children }: AddGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const { addGoal, editGoal } = useFinanceStore()

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
                })
            } else {
                form.reset({
                    name: "",
                    targetAmount: "",
                    currentAmount: "0",
                    type: "short-term",
                })
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
            })
        } else {
            addGoal({
                id: crypto.randomUUID(),
                name: values.name,
                targetAmount: Number(values.targetAmount),
                currentAmount: Number(values.currentAmount),
                type: values.type as 'short-term' | 'long-term',
            })
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

                        <DialogFooter>
                            <Button type="submit">{existingGoal ? "Save Changes" : "Create Goal"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
