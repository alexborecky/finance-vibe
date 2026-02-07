"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useFinanceStore } from "@/lib/store"
import { Asset } from "@/lib/finance-engine"

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Value must be positive",
    }),
    category: z.enum(['property', 'investment', 'savings', 'vehicle', 'other']),
    interestRate: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Interest rate must be a positive number",
    }),
})

interface AddAssetDialogProps {
    children?: React.ReactNode;
    assetToEdit?: Asset;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddAssetDialog({ children, assetToEdit, open: controlledOpen, onOpenChange }: AddAssetDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const { user } = useAuth()
    const { addAsset, updateAsset } = useFinanceStore()

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            value: "",
            category: "other",
            interestRate: "",
        },
    })

    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (assetToEdit) {
            form.reset({
                name: assetToEdit.name,
                value: assetToEdit.value.toString(),
                category: assetToEdit.category,
                interestRate: assetToEdit.interestRate?.toString() || "",
            })
        } else {
            form.reset({
                name: "",
                value: "",
                category: "other",
                interestRate: "",
            })
        }
        setError(null)
    }, [assetToEdit, form, isOpen])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('[Dialog] Submitting asset form:', values);
        if (!user) {
            setError("You must be logged in to add assets.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const assetData = {
                name: values.name,
                value: Number(values.value),
                category: values.category,
                interestRate: values.interestRate ? Number(values.interestRate) : undefined,
            }

            if (assetToEdit) {
                console.log('[Dialog] Updating existing asset...');
                await updateAsset(assetToEdit.id, assetData)
            } else {
                console.log('[Dialog] Adding new asset...');
                await addAsset(assetData, user.id)
            }

            console.log('[Dialog] Operation successful, closing modal...');
            if (setIsOpen) setIsOpen(false)
            form.reset()
        } catch (error: any) {
            console.error("[Dialog] Catch block caught error:", error);
            setError(error.message || "Failed to save asset")
        } finally {
            setIsSubmitting(false)
        }
    }

    const category = form.watch("category")
    const showInterestRate = category === 'investment' || category === 'savings'

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button><Plus className="mr-2 h-4 w-4" /> Add Asset</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{assetToEdit ? "Edit Asset" : "Add New Asset"}</DialogTitle>
                    <DialogDescription>
                        {assetToEdit ? "Update the details of your asset." : "Track a new physical or digital asset value."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Apartment, Tesla, Bitcoin..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value (CZK)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="100000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="property">Property</SelectItem>
                                                <SelectItem value="vehicle">Vehicle</SelectItem>
                                                <SelectItem value="investment">Investment</SelectItem>
                                                <SelectItem value="savings">Savings</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {showInterestRate && (
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Interest Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="3.5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}



                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : (assetToEdit ? "Save Changes" : "Add Asset")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
