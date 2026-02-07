import {
    Home,
    Car,
    TrendingUp,
    Landmark,
    Box,
    Edit2
} from "lucide-react"
import { AddAssetDialog } from "@/components/add-asset-dialog"
import { useFinanceStore } from "@/lib/store"
import { Asset } from "@/lib/finance-engine"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

function AssetIcon({ category }: { category: Asset['category'] }) {
    switch (category) {
        case 'property': return <Home className="h-4 w-4 text-blue-500" />;
        case 'vehicle': return <Car className="h-4 w-4 text-orange-500" />;
        case 'investment': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        case 'savings': return <Landmark className="h-4 w-4 text-purple-500" />;
        default: return <Box className="h-4 w-4 text-slate-500" />;
    }
}

export function AssetList() {
    const { assets } = useFinanceStore()

    if (assets.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
                <Box className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p>No assets added yet.</p>
            </div>
        )
    }

    return (
        <Card className="h-full shadow-md px-4">
            <CardContent className="p-0">
                <div className="grid">
                    {assets.map((asset) => (
                        <AddAssetDialog key={asset.id} assetToEdit={asset}>
                            <div className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 py-3 px-2 transition-all border-b last:border-0 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <AssetIcon category={asset.category} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                {asset.name}
                                                <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </div>
                                            <div className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                                                {asset.category}
                                                {asset.interestRate && (
                                                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">
                                                        {asset.interestRate}% APY
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">{formatCurrency(asset.value)}</div>
                                    </div>
                                </div>
                            </div>
                        </AddAssetDialog>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
