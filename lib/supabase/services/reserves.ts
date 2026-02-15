import { createClient } from '@/lib/supabase/client'
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns'

export async function getEmergencyFundStats(userId: string) {
    const supabase = createClient()

    // 1. Sliding window: last 90 days (including today)
    // This handles new accounts better than full calendar months
    const endDate = new Date()
    const startDate = subMonths(endDate, 3)

    // Fetch all needs in this period, we'll filter in JS to handle fallback easily
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, is_recurring, date') // Added 'date' to selection
        .eq('user_id', userId)
        .eq('category', 'need')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd')) as any

    if (error) {
        console.error('Error fetching transactions for reserves:', error)
        throw error
    }

    const txs = (transactions as { amount: number; is_recurring: boolean; date: string }[]) || []

    // Helper to calculate monthly average from a set of transactions
    const calculateMonthlyAverage = (filteredTxs: typeof txs) => {
        if (filteredTxs.length === 0) return 0

        // Group by YYYY-MM
        const months = new Set(filteredTxs.map(t => t.date.substring(0, 7)))
        const total = filteredTxs.reduce((sum, t) => sum + t.amount, 0)

        // Use at least 1 shift as divisor, but prefer the actual number of months present
        // If data spans 1 month, calculate average for that month.
        return Math.ceil(total / Math.max(1, months.size))
    }

    // 2. Try strictly recurring first
    const recurringNeeds = txs.filter(t => t.is_recurring)
    let averageMonthlyNeeds = calculateMonthlyAverage(recurringNeeds)

    // 3. Fallback: If no recurring marked (or average is 0), use average of all Needs in the period
    if (averageMonthlyNeeds === 0 && txs.length > 0) {
        averageMonthlyNeeds = calculateMonthlyAverage(txs)
    }

    return {
        averageMonthlyNeeds,
        recommended: {
            minTarget: averageMonthlyNeeds * 3, // 3 months min
            fortress: averageMonthlyNeeds * 6   // 6 months
        }
    }
}
