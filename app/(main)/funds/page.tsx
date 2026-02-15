"use client"

import { FundCard } from "@/components/fund-card"
import { AddFundDialog } from "@/components/add-fund-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function FundPage() {
    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Funds</h2>
                    <p className="text-muted-foreground">Manage your emergency funds and safety nets.</p>
                </div>
                <AddFundDialog>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Fund</Button>
                </AddFundDialog>
            </div>
            <div className="flex-1 min-h-0">
                <FundCard />
            </div>
        </div>
    )
}
