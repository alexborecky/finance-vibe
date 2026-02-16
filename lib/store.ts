import { create } from 'zustand';
import {
    IncomeConfig,
    IncomeConfigSchema,
    calculateMonthlyIncome,
    calculateBuckets,
    calculateFinanceOverview,
    Transaction,
    FinancialGoal,
    FinanceOverview,
    Asset
} from './finance-engine';

import { getGoals, createGoal, updateGoal, deleteGoal, updateGoalProgress } from '@/lib/supabase/services/goals';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/supabase/services/transactions';
import { updateIncomeConfig as updateIncomeConfigDB, updatePreferences as updatePreferencesDB } from '@/lib/supabase/services/profile';
import { getAssets, createAsset, updateAsset as updateAssetDB, deleteAsset as deleteAssetDB } from '@/lib/supabase/services/assets';
import { format } from 'date-fns';

// Helper to convert DB dates to Date objects
function convertDBGoal(dbGoal: any): FinancialGoal {
    return {
        id: dbGoal.id,
        name: dbGoal.title,
        targetAmount: Number(dbGoal.target_amount),
        currentAmount: Number(dbGoal.current_amount),
        type: dbGoal.type,
        deadlineMonths: dbGoal.deadline ? undefined : undefined,
        targetDate: dbGoal.deadline ? new Date(dbGoal.deadline) : undefined,
        savingStrategy: dbGoal.saving_strategy || undefined,
        metadata: dbGoal.metadata || undefined,
    };
}

function convertDBTransaction(dbTx: any): Transaction {
    // Parse date explicitly as local time to avoid UTC adjustments
    // "2024-01-01" -> new Date(2024, 0, 1) [Local midnight]
    const [year, month, day] = dbTx.date.split('-').map(Number);

    return {
        id: dbTx.id,
        amount: Number(dbTx.amount),
        category: dbTx.category,
        date: new Date(year, month - 1, day),
        description: dbTx.description || undefined,
        isRecurring: dbTx.is_recurring || false,
        recurringEndDate: dbTx.recurring_end_date ? new Date(dbTx.recurring_end_date) : undefined,
        recurringSourceId: dbTx.recurring_source_id || undefined,
        metadata: dbTx.metadata || undefined,
    };
}

function convertDBAsset(dbAsset: any): Asset {
    return {
        id: dbAsset.id,
        name: dbAsset.name,
        value: Number(dbAsset.value),
        category: dbAsset.category as any,
        interestRate: (dbAsset.interest_rate !== null && dbAsset.interest_rate !== undefined)
            ? Number(dbAsset.interest_rate)
            : undefined,
    };
}

interface FinanceState {
    // User Configuration
    incomeConfig: IncomeConfig;
    setIncomeConfig: (config: IncomeConfig, userId?: string) => Promise<void>;

    // Preferences
    preferences: Record<string, any>;
    setPreferences: (prefs: Record<string, any>, userId?: string) => Promise<void>;

    // Data
    goals: FinancialGoal[];
    addGoal: (goal: Omit<FinancialGoal, 'id'>, userId: string) => Promise<void>;
    editGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
    updateGoalProgress: (id: string, amount: number) => Promise<void>;
    removeGoal: (id: string, deleteTransactions?: boolean) => Promise<void>;

    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>, userId: string) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    assets: Asset[];
    addAsset: (asset: Omit<Asset, 'id'>, userId: string) => Promise<void>;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    removeAsset: (id: string) => Promise<void>;

    // Loading states
    loading: boolean;
    initialized: boolean;

    // Sync with Supabase
    loadUserData: (userId: string, profile: any) => Promise<void>;
    clearData: () => void;

    // Derived State (Getters)
    getOverview: () => FinanceOverview;
}

// Default Initial State
const initialIncomeConfig: IncomeConfig = {
    mode: 'fixed',
    amount: 0,
    tax: 0,
    paymentDelay: false
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
    incomeConfig: initialIncomeConfig,
    preferences: {},
    goals: [],
    transactions: [],
    assets: [],
    loading: false,
    initialized: false,

    setIncomeConfig: async (config, userId) => {
        const previousConfig = get().incomeConfig;
        set({ incomeConfig: config });

        if (userId) {
            try {
                const dbConfig: any = {
                    income_mode: config.mode,
                    tax_rate: config.tax,
                    payment_delay: config.paymentDelay
                };

                if (config.mode === 'fixed' || config.mode === 'manual') {
                    dbConfig.income_amount = config.amount;
                } else if (config.mode === 'hourly') {
                    dbConfig.hourly_rate = config.hourlyRate;
                    dbConfig.hours_per_week = config.hoursPerWeek;
                }

                if (config.mode === 'hourly' && config.adjustments) {
                    dbConfig.income_adjustments = config.adjustments;
                }

                await updateIncomeConfigDB(userId, dbConfig);
            } catch (error) {
                console.error('Error saving income config:', error);
                set({ incomeConfig: previousConfig });
                throw error;
            }
        }
    },

    setPreferences: async (prefs, userId) => {
        const previousPrefs = get().preferences;
        set((state) => ({ preferences: { ...state.preferences, ...prefs } }));

        if (userId) {
            try {
                const currentPrefs = get().preferences;
                await updatePreferencesDB(userId, currentPrefs);
            } catch (error) {
                console.error('Error saving preferences:', JSON.stringify(error));
                set({ preferences: previousPrefs });
                throw error;
            }
        }
    },

    addGoal: async (goal, userId) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const optimisticGoal: FinancialGoal = { ...goal, id: tempId };
        set((state) => ({ goals: [...state.goals, optimisticGoal] }));

        try {
            const created = await createGoal({
                user_id: userId,
                title: goal.name,
                target_amount: goal.targetAmount,
                current_amount: goal.currentAmount || 0,
                type: goal.type,
                deadline: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : null,
                saving_strategy: goal.savingStrategy || null,
                metadata: goal.metadata || null,
            });

            // Replace temp with real
            set((state) => ({
                goals: state.goals.map(g => g.id === tempId ? convertDBGoal(created) : g)
            }));
        } catch (error) {
            // Revert on error
            set((state) => ({ goals: state.goals.filter(g => g.id !== tempId) }));
            throw error;
        }
    },

    editGoal: async (id, updates) => {
        // Optimistic update
        const previous = get().goals;
        set((state) => ({
            goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));

        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.title = updates.name;
            if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
            if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
            if (updates.type !== undefined) dbUpdates.type = updates.type;
            if (updates.targetDate !== undefined) {
                dbUpdates.deadline = updates.targetDate ? updates.targetDate.toISOString().split('T')[0] : null;
            }
            if (updates.savingStrategy !== undefined) {
                dbUpdates.saving_strategy = updates.savingStrategy || null;
            }
            if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

            await updateGoal(id, dbUpdates);
        } catch (error) {
            // Revert on error
            set({ goals: previous });
            throw error;
        }
    },

    updateGoalProgress: async (id, amount) => {
        const previous = get().goals;
        set((state) => ({
            goals: state.goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g)
        }));

        try {
            await updateGoalProgress(id, amount);
        } catch (error) {
            set({ goals: previous });
            throw error;
        }
    },

    removeGoal: async (id, deleteAssociatedTransactions = false) => {
        const goal = get().goals.find(g => g.id === id);
        const previousGoals = get().goals;
        const previousTransactions = get().transactions;

        // Optimistic update for goals
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));

        let txToDelete: string[] = [];
        if (deleteAssociatedTransactions && goal) {
            const descriptionPattern = `Saving for ${goal.name}`;
            txToDelete = get().transactions
                .filter(t => t.description === descriptionPattern)
                .map(t => t.id);

            if (txToDelete.length > 0) {
                set((state) => ({
                    transactions: state.transactions.filter(t => !txToDelete.includes(t.id))
                }));
            }
        }

        try {
            await deleteGoal(id);
            if (txToDelete.length > 0) {
                await Promise.all(txToDelete.map(txId => deleteTransaction(txId)));
            }
        } catch (error) {
            set({ goals: previousGoals, transactions: previousTransactions });
            throw error;
        }
    },

    addTransaction: async (transaction, userId) => {
        const tempId = crypto.randomUUID();
        const optimisticTx: Transaction = { ...transaction, id: tempId };
        set((state) => ({ transactions: [...state.transactions, optimisticTx] }));

        try {
            const created = await createTransaction({
                id: tempId,
                user_id: userId,
                amount: transaction.amount,
                category: transaction.category as 'need' | 'want' | 'saving' | 'income',
                description: transaction.description || null,
                date: format(transaction.date, 'yyyy-MM-dd'),
                is_recurring: transaction.isRecurring,
                recurring_end_date: transaction.recurringEndDate ? format(transaction.recurringEndDate, 'yyyy-MM-dd') : null,
                recurring_source_id: transaction.recurringSourceId || null,
                metadata: transaction.metadata || null,
            });

            set((state) => ({
                transactions: state.transactions.map(t => t.id === tempId ? convertDBTransaction(created) : t)
            }));
        } catch (error) {
            console.error("Error adding transaction:", error);
            set((state) => ({ transactions: state.transactions.filter(t => t.id !== tempId) }));
            throw error;
        }
    },

    updateTransaction: async (id, updates) => {
        const previous = get().transactions;
        set((state) => ({
            transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
        }));

        try {
            const dbUpdates: any = {};
            if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.date !== undefined) dbUpdates.date = format(updates.date, 'yyyy-MM-dd');
            if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
            if (updates.recurringEndDate !== undefined) {
                dbUpdates.recurring_end_date = updates.recurringEndDate ? format(updates.recurringEndDate, 'yyyy-MM-dd') : null;
            }
            if (updates.recurringSourceId !== undefined) dbUpdates.recurring_source_id = updates.recurringSourceId;
            if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

            await updateTransaction(id, dbUpdates);
        } catch (error) {
            set({ transactions: previous });
            throw error;
        }
    },

    deleteTransaction: async (id) => {
        const previous = get().transactions;
        set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));

        try {
            await deleteTransaction(id);
        } catch (error) {
            set({ transactions: previous });
            throw error;
        }
    },

    addAsset: async (asset, userId) => {
        console.log('[Store] Adding asset:', { asset, userId });
        const tempId = crypto.randomUUID();
        const optimisticAsset: Asset = { ...asset, id: tempId };
        set((state) => ({ assets: [optimisticAsset, ...state.assets] }));

        try {
            console.log('[Store] Calling createAsset service...');
            const created = await createAsset({
                user_id: userId,
                name: asset.name,
                value: asset.value,
                category: asset.category,
                interest_rate: asset.interestRate !== undefined ? asset.interestRate : null,
            });

            console.log('[Store] Asset created in DB, updating state:', created);
            set((state) => ({
                assets: state.assets.map(a => a.id === tempId ? convertDBAsset(created) : a)
            }));
        } catch (error) {
            console.error('[Store] Failed to add asset:', error);
            set((state) => ({ assets: state.assets.filter(a => a.id !== tempId) }));
            throw error;
        }
    },

    updateAsset: async (id, updates) => {
        const previous = get().assets;
        set((state) => ({
            assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
        }));

        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.value !== undefined) dbUpdates.value = updates.value;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate || null;

            await updateAssetDB(id, dbUpdates);
        } catch (error) {
            set({ assets: previous });
            throw error;
        }
    },

    removeAsset: async (id) => {
        const previous = get().assets;
        set((state) => ({ assets: state.assets.filter(a => a.id !== id) }));

        try {
            await deleteAssetDB(id);
        } catch (error) {
            set({ assets: previous });
            throw error;
        }
    },

    loadUserData: async (userId, profile) => {
        set({ loading: true });

        try {
            // Load income config from profile
            const incomeConfig: IncomeConfig = profile.income_mode === 'hourly'
                ? {
                    mode: 'hourly',
                    hourlyRate: Number(profile.hourly_rate || 0),
                    hoursPerWeek: Number(profile.hours_per_week || 0),
                    tax: Number(profile.tax_rate || 0),
                    paymentDelay: profile.payment_delay || false,
                    adjustments: (profile.income_adjustments as Record<string, number>) || {},
                }
                : {
                    mode: profile.income_mode,
                    amount: Number(profile.income_amount || 0),
                    tax: Number(profile.tax_rate || 0),
                    paymentDelay: profile.payment_delay || false,
                };

            // Load preferences
            const preferences = (profile.preferences as Record<string, any>) || {};

            // Load goals and transactions
            const [goalsData, transactionsData] = await Promise.all([
                getGoals(userId),
                getTransactions(userId),
            ]);

            // Load assets separately to avoid blocking if table doesn't exist
            let assetsData: any[] = [];
            try {
                assetsData = await getAssets(userId);
            } catch (error) {
                console.warn("Could not load assets (table might be missing):", error);
            }

            set({
                incomeConfig,
                preferences,
                goals: goalsData.map(convertDBGoal),
                transactions: transactionsData.map(convertDBTransaction),
                assets: assetsData ? assetsData.map(convertDBAsset) : [],
                loading: false,
                initialized: true,
            });
        } catch (error) {
            console.error('Error loading user data:', error);
            set({ loading: false });
        }
    },

    clearData: () => {
        set({
            incomeConfig: initialIncomeConfig,
            preferences: {},
            goals: [],
            transactions: [],
            assets: [],
            initialized: false,
        });
    },

    getOverview: () => {
        const { incomeConfig, transactions, goals, assets } = get();
        return calculateFinanceOverview(incomeConfig, transactions, goals, assets);
    }
}));
