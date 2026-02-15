import { z } from 'zod';
import { isSameMonth, setYear, setMonth, getDate, isBefore, startOfMonth, subMonths } from 'date-fns';

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
    type: 'short-term' | 'long-term' | 'reserve';
    deadlineMonths?: number;
    targetDate?: Date;
    savingStrategy?: 'recurring-wants' | 'lower-savings' | 'manual';
    metadata?: {
        template?: 'emergency' | 'sinking';
        [key: string]: any;
    };
}

export interface Asset {
    id: string;
    name: string;
    value: number;
    category: 'property' | 'investment' | 'savings' | 'vehicle' | 'other';
    interestRate?: number;
}

export const TransactionCategorySchema = z.enum(['need', 'want', 'saving', 'income']);

export type Transaction = {
    id: string;
    amount: number;
    category: z.infer<typeof TransactionCategorySchema>;
    date: Date;
    description?: string;
    isRecurring?: boolean;
    recurringEndDate?: Date;
    recurringSourceId?: string;
    metadata?: {
        incomeDistribution?: {
            needs: boolean;
            wants: boolean;
            savings: boolean;
        };
    };
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
    netWorth: number;
    totalAssets: number;
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

export interface ExtraIncomeAllocation {
    description: string;
    amount: number;
    contribution: BudgetBuckets;
}

export interface MonthlyIncomeDetails {
    date: Date;
    grossIncome: number;
    netIncome: number;
    workingDays: number;
    freeDays: number;
    billableDays: number;
    extraIncomeTotal: number;
    extraIncomes: Transaction[];
    extraIncomeAllocations: ExtraIncomeAllocation[];
    baseBuckets: BudgetBuckets;
    buckets: BudgetBuckets;
}

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
export const calculateDailyAllowance = (remainingWants: number, referenceDate: Date = new Date()): number => {
    const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
    const today = referenceDate.getDate();
    const remainingDays = daysInMonth - today + 1;

    return remainingWants / remainingDays;
};

// --- Adapters & Helpers for Components & Store ---

export const IncomeModeSchema = z.enum(['fixed', 'hourly', 'manual']);
export const IncomeConfigSchema = z.discriminatedUnion('mode', [
    z.object({
        mode: z.literal('fixed'),
        amount: z.number().min(0, "Amount must be positive"),
        tax: z.number().min(0).optional().default(0),
        paymentDelay: z.boolean().optional().default(false),
    }),
    z.object({
        mode: z.literal('manual'),
        amount: z.number().min(0, "Amount must be positive"),
        tax: z.number().min(0).optional().default(0),
        paymentDelay: z.boolean().optional().default(false),
    }),
    z.object({
        mode: z.literal('hourly'),
        hourlyRate: z.number().min(0, "Hourly rate must be positive"),
        hoursPerWeek: z.number().min(0, "Hours cannot be negative").max(168, "Max hours exceeded"),
        tax: z.number().min(0).optional().default(0),
        paymentDelay: z.boolean().optional().default(false), // If true, income is based on previous month's work
        adjustments: z.record(z.string(), z.number()).optional().default({}), // Key: "YYYY-MM", Value: freeDays
    }),
]);
export type IncomeConfig = z.infer<typeof IncomeConfigSchema>;

export function getManDayRate(config: IncomeConfig): number {
    if (config.mode !== 'hourly') return 0;
    // user specified: Keep hourly rate and hours per week. Man Day Rate based on that.
    // Assuming 5 day work week.
    // Daily Income = (Weekly Income) / 5
    // Weekly Income = Hourly Rate * Hours Per Week
    return (config.hourlyRate * config.hoursPerWeek) / 5;
}

export function getWorkingDaysInMonth(date: Date): number {
    const start = startOfMonth(date);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let count = 0;
    let current = start;
    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // 0 = Sun, 6 = Sat
            count++;
        }
        current = new Date(current.setDate(current.getDate() + 1));
    }
    return count;
}

export function calculateMonthlyIncome(config: IncomeConfig, date: Date = new Date()): number {
    switch (config.mode) {
        case 'fixed':
        case 'manual':
            return config.amount;
        case 'hourly':
            const manDayRate = getManDayRate(config);
            const effectiveDate = config.paymentDelay ? subMonths(date, 1) : date;
            const workingDays = getWorkingDaysInMonth(effectiveDate);
            const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`;
            const freeDays = config.adjustments?.[monthKey] || 0;

            const gross = (workingDays - freeDays) * manDayRate;
            const net = gross - (config.tax || 0);
            return Math.max(0, net);
    }
}

export function calculateMonthlyIncomeDetails(
    config: IncomeConfig,
    transactions: Transaction[],
    date: Date
): MonthlyIncomeDetails {
    const effectiveDate = (config.mode === 'hourly' && config.paymentDelay)
        ? subMonths(date, 1)
        : date;

    const workingDays = getWorkingDaysInMonth(effectiveDate);
    const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`;
    const freeDays = config.mode === 'hourly' ? (config.adjustments?.[monthKey] || 0) : 0;
    const billableDays = Math.max(0, workingDays - freeDays);

    let baseGross = 0;
    let baseNet = 0;

    if (config.mode === 'hourly') {
        const manDayRate = getManDayRate(config);
        baseGross = billableDays * manDayRate;
        baseNet = Math.max(0, baseGross - (config.tax || 0));
    } else {
        baseGross = config.amount;
        baseNet = config.amount;
    }

    // Filter extra incomes for this month
    const extraIncomes = transactions.filter(t =>
        t.category === 'income' && isSameMonth(new Date(t.date), date)
    );

    const extraIncomeTotal = extraIncomes.reduce((sum, t) => sum + t.amount, 0);
    const totalNet = baseNet + extraIncomeTotal;

    // Calculate Base Net Income Buckets (Standard 50/30/20)
    const baseBuckets = calculateBuckets(baseNet);

    // Initialize buckets with base values
    const buckets = { ...baseBuckets };
    const extraIncomeAllocations: ExtraIncomeAllocation[] = [];

    // Distribute Extra Income based on preferences
    extraIncomes.forEach(income => {
        const distribution = income.metadata?.incomeDistribution || {
            needs: true,
            wants: true,
            savings: true
        };

        const totalWeight = (distribution.needs ? 50 : 0) +
            (distribution.wants ? 30 : 0) +
            (distribution.savings ? 20 : 0);

        const incomeContribution: BudgetBuckets = { needs: 0, wants: 0, savings: 0 };

        if (totalWeight > 0) {
            const ratio = income.amount / totalWeight;
            if (distribution.needs) {
                const amount = ratio * 50;
                buckets.needs += amount;
                incomeContribution.needs = amount;
            }
            if (distribution.wants) {
                const amount = ratio * 30;
                buckets.wants += amount;
                incomeContribution.wants = amount;
            }
            if (distribution.savings) {
                const amount = ratio * 20;
                buckets.savings += amount;
                incomeContribution.savings = amount;
            }
        } else {
            // Fallback: distribute standard 50/30/20 if nothing selected
            incomeContribution.needs = income.amount * 0.5;
            incomeContribution.wants = income.amount * 0.3;
            incomeContribution.savings = income.amount * 0.2;
            buckets.needs += incomeContribution.needs;
            buckets.wants += incomeContribution.wants;
            buckets.savings += incomeContribution.savings;
        }

        extraIncomeAllocations.push({
            description: income.description || "Extra Income",
            amount: income.amount,
            contribution: incomeContribution
        });
    });

    return {
        date,
        grossIncome: baseGross,
        netIncome: totalNet,
        workingDays,
        freeDays,
        billableDays,
        extraIncomeTotal,
        extraIncomes,
        extraIncomeAllocations,
        baseBuckets,
        buckets
    };
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
    goals: FinancialGoal[],
    assets: Asset[] = [],
    referenceDate: Date = new Date()
): FinanceOverview {
    const currentMonthTransactions = transactions.filter(t =>
        isSameMonth(new Date(t.date), referenceDate)
    );

    let totalIncome = calculateMonthlyIncome(incomeConfig, referenceDate);

    // 1. Calculate Spent per Category and Add Additional Income
    const spent = {
        needs: 0,
        wants: 0,
        savings: 0,
    };

    currentMonthTransactions.forEach((t) => {
        if (t.category === 'need') spent.needs += t.amount;
        if (t.category === 'want') spent.wants += t.amount;
        if (t.category === 'saving') spent.savings += t.amount;
        if (t.category === 'income') totalIncome += t.amount;
    });

    const allocations = calculateBuckets(totalIncome);

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

    const overview: FinanceOverview = {
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
        netWorth: 0, // Calculated below
        totalAssets: 0,
    };

    // Calculate Totals
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalGoalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    // Remaining budget for the month (Needs + Wants + Savings)
    // This is a rough approximation of "leftover money from expenses"
    const remainingBudget =
        overview.buckets.needs.remaining +
        overview.buckets.wants.remaining +
        overview.buckets.savings.remaining;

    overview.totalAssets = totalAssets;
    overview.netWorth = totalAssets + totalGoalProgress + Math.max(0, remainingBudget);

    return overview;
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
    const projectedTransactions = recurringTransactions
        .filter(t => {
            // Filter out if past end date
            if (t.recurringEndDate && isBefore(t.recurringEndDate, targetMonthStart)) {
                return false;
            }
            // Filter out if an "exception" (derived transaction) exists for this month
            const hasException = actualTransactions.some(at => at.recurringSourceId === t.id);
            return !hasException;
        })
        .map(t => {
            // Create a new date for this transaction in the target month (preserve day)
            let projectedDate = setYear(setMonth(new Date(t.date), targetMonthIndex), targetYear);

            return {
                ...t,
                id: `recurring_${t.id}_${targetYear}_${targetMonthIndex}`,
                date: projectedDate,
                description: t.description,
            };
        });

    return [...actualTransactions, ...projectedTransactions];
}

/**
 * Checks for negative balances in the next X months.
 * Returns the first date where a negative balance is detected.
 */
export function checkProjectedSolvency(
    incomeConfig: IncomeConfig,
    transactions: Transaction[],
    goals: FinancialGoal[],
    monthsToCheck: number = 12,
    referenceDate: Date = new Date()
): { hasAlert: boolean; firstFailingMonth: Date | null; failingMonths: Date[] } {
    const today = referenceDate;
    const failingMonths: Date[] = [];

    for (let i = 0; i < monthsToCheck; i++) {
        // Create date for the 1st of the month being checked
        const checkDate = new Date(today.getFullYear(), today.getMonth() + i, 1);

        // 1. Get Income for this month
        // We use calculateMonthlyIncomeDetails to get a more accurate net income including extra incomes
        const incomeDetails = calculateMonthlyIncomeDetails(incomeConfig, transactions, checkDate);
        const totalIncome = incomeDetails.netIncome;

        // 2. Get Expenses for this month using the existing projection logic
        const monthlyTransactions = getExpensesForMonth(transactions, checkDate);

        const spent = {
            needs: 0,
            wants: 0,
            savings: 0,
        };

        monthlyTransactions.forEach((t) => {
            if (t.category === 'need') spent.needs += t.amount;
            if (t.category === 'want') spent.wants += t.amount;
            if (t.category === 'saving') spent.savings += t.amount;
        });

        const allocations = calculateBuckets(totalIncome);

        const remaining = {
            needs: allocations.needs - spent.needs,
            wants: allocations.wants - spent.wants,
        };

        // Check for negative balance in Needs or Wants
        if (remaining.needs < 0 || remaining.wants < 0) {
            failingMonths.push(checkDate);
        }
    }

    return {
        hasAlert: failingMonths.length > 0,
        firstFailingMonth: failingMonths.length > 0 ? failingMonths[0] : null,
        failingMonths
    };
}
