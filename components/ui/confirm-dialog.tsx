"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    showCancel = true,
    variant = "default",
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {showCancel && (
                        <AlertDialogCancel onClick={() => {
                            onCancel?.()
                            onOpenChange(false)
                        }}>
                            {cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        variant={variant}
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
