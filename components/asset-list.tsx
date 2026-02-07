"use client"

import { useFinanceStore } from "@/lib/store"
import { Asset } from "@/lib/finance-engine"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddAssetDialog } from "@/components/add-asset-dialog"
import {
    Briefcase,
    Home,
    Car,
    TrendingUp,
    Landmark,
    MoreHorizontal,
    Pencil,
    Trash2,
    Box
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils" // Assuming utils exists, or I'll implement inline

function AssetIcon({ category }: { category: Asset['category'] }) {
    switch (category) {
        case 'property': return <Home className="h-5 w-5 text-blue-500" />;
        case 'vehicle': return <Car className="h-5 w-5 text-orange-500" />;
        case 'investment': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
        case 'savings': return <Landmark className="h-5 w-5 text-purple-500" />;
        default: return <Box className="h-5 w-5 text-slate-500" />;
    }
}

export function AssetList() {
    const { assets, removeAsset } = useFinanceStore()
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this asset?")) {
            await removeAsset(id)
        }
    }

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset)
        setIsDialogOpen(true)
    }

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) setEditingAsset(null)
    }

    if (assets.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
                <Box className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p>No assets added yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <AddAssetDialog
                open={isDialogOpen}
                onOpenChange={handleDialogChange}
                assetToEdit={editingAsset || undefined}
            />

            <div className="grid gap-4">
                {assets.map((asset) => (
                    <Card key={asset.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <AssetIcon category={asset.category} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{asset.name}</h3>
                                        <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                                            {asset.category}
                                            {asset.interestRate && (
                                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                    {asset.interestRate}% APY
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{asset.value.toLocaleString()} Kč</p>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(asset)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(asset.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
