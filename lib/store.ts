import { create } from 'zustand';
import {
    IncomeConfig,
    IncomeConfigSchema,
    calculateMonthlyIncome,
    calculateBuckets,
    calculateFinanceOverview,
    Transaction,
    FinancialGoal,
    FinanceOverview
} from './finance-engine';

interface FinanceState {
    // User Configuration
    incomeConfig: IncomeConfig;
    setIncomeConfig: (config: IncomeConfig) => void;

    // Data (Mocked for now, will sync with Supabase)
    goals: FinancialGoal[];
    addGoal: (goal: FinancialGoal) => void;
    editGoal: (id: string, updates: Partial<FinancialGoal>) => void;
    updateGoalProgress: (id: string, amount: number) => void;

    transactions: Transaction[];
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;

    // Derived State (Getters)
    getOverview: () => FinanceOverview;
}

// Default Initial State
const initialIncomeConfig: IncomeConfig = {
    mode: 'fixed',
    amount: 0
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
    incomeConfig: initialIncomeConfig,
    setIncomeConfig: (config) => set({ incomeConfig: config }),

    goals: [
        {
            id: '1',
            name: 'Macbook Pro M4',
            targetAmount: 60000,
            currentAmount: 27000,
            type: 'short-term' // Funded by Wants (30%)
        },
        {
            id: '2',
            name: 'House Downpayment',
            targetAmount: 2000000,
            currentAmount: 150000,
            type: 'long-term' // Funded by Savings (20%)
        }
    ],
    addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
    editGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    })),
    updateGoalProgress: (id, amount) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g)
    })),

    transactions: [
        {
            id: 't1',
            amount: 15000,
            category: 'need',
            date: new Date(),
            description: 'Rent'
        },
        {
            id: 't2',
            amount: 450,
            category: 'want',
            date: new Date(),
            description: 'Coffee & Brunch'
        }
    ],
    addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, transaction] })),
    updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    })),
    deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
    })),

    getOverview: () => {
        const { incomeConfig, transactions, goals } = get();
        // Use the comprehensive logic from finance-engine
        return calculateFinanceOverview(incomeConfig, transactions, goals);
    }
}));
