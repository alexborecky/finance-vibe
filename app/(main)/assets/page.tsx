"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddAssetDialog } from "@/components/add-asset-dialog"

export default function AssetsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
                <AddAssetDialog />
            </div>

            <Card className="border-dashed border-2 bg-slate-50 dark:bg-slate-900/50">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4 w-fit">
                        <Construction className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        We are currently working on the Assets module. Stay tuned!
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    This module will allow you to track your physical and digital assets.
                </CardContent>
            </Card>
        </div>
    )
}
