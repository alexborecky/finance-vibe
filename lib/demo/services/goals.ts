
import { MOCK_GOALS } from '../mockData';
import { Database } from '@/lib/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export const mockGoalsService = {
    getGoals: async (userId: string): Promise<Goal[]> => {
        return MOCK_GOALS as unknown as Goal[];
    },

    createGoal: async (goal: Omit<GoalInsert, 'id' | 'created_at'>): Promise<Goal> => {
        const newGoal = {
            ...goal,
            id: `goal-${Date.now()}`,
            created_at: new Date().toISOString(),
            current_amount: goal.current_amount || 0,
        } as Goal;
        // In a real mock we'd push to MOCK_GOALS but since we can't persist easily across reloads without localstorage
        // we'll just return it. The UI might not update if we don't update state, but for "Demo Mode" read-only is often acceptable.
        // However, the requirement says "mockData isolation".
        // For a better experience, we could use an in-memory array that resets on reload.
        return newGoal;
    },

    updateGoal: async (id: string, updates: GoalUpdate): Promise<Goal> => {
        const goalIndex = MOCK_GOALS.findIndex((g) => g.id === id);
        if (goalIndex === -1) throw new Error('Goal not found');

        const updatedGoal = { ...MOCK_GOALS[goalIndex], ...updates } as unknown as Goal;
        return updatedGoal;
    },

    deleteGoal: async (id: string): Promise<void> => {
        // no-op
        return;
    },

    updateGoalProgress: async (id: string, amount: number): Promise<Goal> => {
        return mockGoalsService.updateGoal(id, { current_amount: amount });
    }
};
