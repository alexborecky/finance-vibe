"use client"

import { AssetList } from "@/components/asset-list"
import { AddAssetDialog } from "@/components/add-asset-dialog"
import { useFinanceStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"

export default function AssetsPage() {
    const { getOverview } = useFinanceStore()
    const overview = getOverview()

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
                    <p className="text-muted-foreground">
                        Total Assets: <span className="font-semibold text-foreground">{formatCurrency(overview.totalAssets)}</span>
                    </p>
                </div>
                <AddAssetDialog />
            </div>

            <AssetList />
        </div>
    )
}
