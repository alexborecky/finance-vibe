"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useFinanceStore } from "@/lib/store"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface TransactionListProps {
    className?: string;
    filter?: 'all' | 'need' | 'want' | 'saving';
}

export function TransactionList({ className, filter = 'all' }: TransactionListProps) {
    const transactions = useFinanceStore(state => state.transactions)

    const filteredTransactions = transactions
        .filter(t => filter === 'all' || t.category === filter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const getBadgeVariant = (category: string) => {
        switch (category) {
            case 'need': return 'secondary'; // Blue-ish usually
            case 'want': return 'default'; // Dark/Purple usually
            case 'saving': return 'outline'; // Emerald/Green usually
            default: return 'outline';
        }
    }

    // Custom logic to match our color scheme manually if badge variants aren't enough
    const getBadgeStyle = (category: string) => {
        switch (category) {
            case 'need': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100";
            case 'want': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-100";
            case 'saving': return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-100";
            default: return "";
        }
    }

    if (filteredTransactions.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No transactions found.</div>
    }

    return (
        <div className={`rounded-md border ${className}`}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                                {format(new Date(transaction.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                                <Badge className={getBadgeStyle(transaction.category)} variant="secondary">
                                    {transaction.category.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                -{transaction.amount.toLocaleString('cs-CZ')} Kč
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
