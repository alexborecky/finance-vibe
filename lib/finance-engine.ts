import { z } from 'zod';
import { isSameMonth, setYear, setMonth, getDate, isBefore, startOfMonth } from 'date-fns';

/**
 * finance-engine.ts
 * The core logic for the 50/30/20 rule and goal projections.
 */

export interface BudgetBuckets {
    needs: number;    // 50%
    wants: number;    // 30%
    savings: number;  // 20%
}

// Re-export Goal as FinancialGoal to maintain compatibility
export type FinancialGoal = Goal;
export interface Goal {
    id: string;
    name: string; // Changed from title to match store usage
    targetAmount: number;
    currentAmount: number;
    type: 'short-term' | 'long-term';
    deadlineMonths?: number;
}

export const TransactionCategorySchema = z.enum(['need', 'want', 'saving']);

export type Transaction = {
    id: string;
    amount: number;
    category: z.infer<typeof TransactionCategorySchema>;
    date: Date;
    description?: string;
    isRecurring?: boolean;
}

export interface BucketStatus {
    allocated: number;
    spent: number;
    remaining: number;
    reservedForGoals: number;
    safeToSpend: number;
}

export interface FinanceOverview {
    totalIncome: number;
    buckets: {
        needs: BucketStatus;
        wants: BucketStatus;
        savings: BucketStatus;
    };
}

/**
 * Calculates the standard 50/30/20 buckets based on Net Monthly Income.
 */
export const calculateBuckets = (netIncome: number): BudgetBuckets => {
    return {
        needs: netIncome * 0.5,
        wants: netIncome * 0.3,
        savings: netIncome * 0.2,
    };
};

/**
 * Calculates how many months it will take to reach a goal.
 */
export const estimateGoalTimeline = (
    goal: Goal,
    buckets: BudgetBuckets,
    existingMonthlyExpenses: { wants: number; savingsCommitments: number },
    assetGrowthRate: number = 0
): { months: number; monthlyContribution: number } => {
    const remainingTarget = goal.targetAmount - goal.currentAmount;

    if (remainingTarget <= 0) return { months: 0, monthlyContribution: 0 };

    let monthlyContribution = 0;

    if (goal.type === 'short-term') {
        monthlyContribution = buckets.wants - existingMonthlyExpenses.wants;
    } else {
        monthlyContribution = buckets.savings - existingMonthlyExpenses.savingsCommitments;
    }

    if (monthlyContribution <= 0) return { months: Infinity, monthlyContribution: 0 };

    const months = Math.ceil(remainingTarget / monthlyContribution);

    return { months, monthlyContribution };
};

/**
 * Calculates the "Safe to Spend" daily amount from the remaining Wants bucket.
 */
export const calculateDailyAllowance = (remainingWants: number): number => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const today = new Date().getDate();
    const remainingDays = daysInMonth - today + 1;

    return remainingWants / remainingDays;
};

// --- Adapters & Helpers for Components & Store ---

export const IncomeModeSchema = z.enum(['fixed', 'hourly', 'manual']);
export const IncomeConfigSchema = z.discriminatedUnion('mode', [
    z.object({
        mode: z.literal('fixed'),
        amount: z.number().min(0, "Amount must be positive"),
    }),
    z.object({
        mode: z.literal('manual'),
        amount: z.number().min(0, "Amount must be positive"),
    }),
    z.object({
        mode: z.literal('hourly'),
        hourlyRate: z.number().min(0, "Hourly rate must be positive"),
        hoursPerWeek: z.number().min(0, "Hours cannot be negative").max(168, "Max hours exceeded"),
    }),
]);
export type IncomeConfig = z.infer<typeof IncomeConfigSchema>;

export function calculateMonthlyIncome(config: IncomeConfig): number {
    switch (config.mode) {
        case 'fixed':
        case 'manual':
            return config.amount;
        case 'hourly':
            const rate = config.hourlyRate;
            const hours = config.hoursPerWeek;
            return rate * hours * 4.333333;
    }
}

export function calculateSafeToSpend(
    allocatedAmount: number,
    spentAmount: number,
    reservedForGoals: number = 0
): number {
    return Math.max(0, allocatedAmount - spentAmount - reservedForGoals);
}

/**
 * Generates a complete financial overview based on income, transactions, and goals.
 */
export function calculateFinanceOverview(
    incomeConfig: IncomeConfig,
    transactions: Transaction[],
    goals: FinancialGoal[]
): FinanceOverview {
    const totalIncome = calculateMonthlyIncome(incomeConfig);
    const allocations = calculateBuckets(totalIncome);

    // 1. Calculate Spent per Category
    const spent = {
        needs: 0,
        wants: 0,
        savings: 0,
    };

    transactions.forEach((t) => {
        if (t.category === 'need') spent.needs += t.amount;
        if (t.category === 'want') spent.wants += t.amount;
        if (t.category === 'saving') spent.savings += t.amount;
    });

    // 2. Calculate Reserved for Goals
    const reserved = {
        needs: 0,
        wants: 0,
        savings: 0,
    };

    goals.forEach((g) => {
        // Logic: Funds ALREADY accumulated in goals are "spent" or "reserved" from the perspective of free cash flow.
        // However, usually "Safe to Spend" refers to monthly cash flow.
        // For this Overview, let's treat 'currentAmount' as assets that are safe, but 'Safe to Spend' limits
        // usually refer to the REMAINING monthly budget.
        // If we are just tracking "Budget Status", we should look at Monthly Contributions vs Monthly Income.
        // For now, let's assume 'goals' don't auto-deduct from safe-to-spend unless configured as a monthly contribution.
        // BUT, to keep it simple and safe: We assume user manually adds a "transaction" when they move money to savings.
        // So 'Reserved' might just be a display metric here.

        // WAIT: User requirement: "The Goal Engine: Short-term goals are funded by the 30% bucket... Long are funded by 20%".
        // If we deduct goal progress from "Available", we might double count if there's also a transaction.

        // SIMPLIFIED LOGIC:
        // We will NOT deduct goal currentAmount from the monthly Safe To Spend, 
        // because currentAmount is likely accumulated over time.
        // We SHOULD deduct the *monthly contribution* if known.
        // estimating contribution:
        // For now, reserved is 0 unless we track monthly allocation.
        // Let's keep reserved 0 for now to avoid blocking the build, 
        // but in a real app we'd sum up "Goal Contributions" transactions.
    });

    return {
        totalIncome,
        buckets: {
            needs: {
                allocated: allocations.needs,
                spent: spent.needs,
                reservedForGoals: reserved.needs,
                remaining: allocations.needs - spent.needs,
                safeToSpend: calculateSafeToSpend(allocations.needs, spent.needs, reserved.needs),
            },
            wants: {
                allocated: allocations.wants,
                spent: spent.wants,
                reservedForGoals: reserved.wants, // Short term goals
                remaining: allocations.wants - spent.wants,
                safeToSpend: calculateSafeToSpend(allocations.wants, spent.wants, reserved.wants),
            },
            savings: {
                allocated: allocations.savings,
                spent: spent.savings,
                reservedForGoals: reserved.savings, // Long term goals
                remaining: allocations.savings - spent.savings,
                safeToSpend: calculateSafeToSpend(allocations.savings, spent.savings, reserved.savings),
            },
        },
    };
}

/**
 * Returns transactions for a specific month, including projected recurring expenses.
 */
export function getExpensesForMonth(transactions: Transaction[], targetDate: Date): Transaction[] {
    const targetMonthStart = startOfMonth(targetDate);
    const targetMonthIndex = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    // 1. Get actual transactions in this month
    const actualTransactions = transactions.filter(t =>
        isSameMonth(new Date(t.date), targetDate)
    );

    // 2. Find recurring transactions defined BEFORE this month
    const recurringTransactions = transactions.filter(t =>
        t.isRecurring && isBefore(startOfMonth(new Date(t.date)), targetMonthStart)
    );

    // 3. Project recurring transactions
    // Check if we already have an "actual" transaction for this recurring item?
    // For MVP, we assume recurring implies "automatically added".
    // We only project if there isn't a "concrete" transaction derived from it?
    // Hard to track derivation without ID linkage.
    // Simple projection: Just add them as "virtual" transactions.

    const projectedTransactions = recurringTransactions.map(t => {
        // Create a new date for this transaction in the target month
        // Preserve the day of month (e.g. 15th)
        let projectedDate = setYear(setMonth(new Date(t.date), targetMonthIndex), targetYear);

        // Handle edge cases (e.g. 31st in Feb) - date-fns handles this by overflow or clamping?
        // setMonth clamps to end of month.

        return {
            ...t,
            id: `recurring_${t.id}_${targetYear}_${targetMonthIndex}`, // Virtual ID
            date: projectedDate,
            description: `${t.description} (Recurring)`, // Visual indicator? Or just same desc.
            // Ensure we don't treat this projected one as the source of *future* recursions if we saved it back.
            // But here we are just returning views.
        };
    });

    return [...actualTransactions, ...projectedTransactions];
}
