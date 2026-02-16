
import { isDemoMode } from '@/lib/utils';
import * as supabaseService from './goals.supabase';
import { mockGoalsService } from '@/lib/demo/services/goals';
import type { Database } from '@/lib/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export async function getGoals(userId: string): Promise<Goal[]> {
    if (isDemoMode()) {
        return mockGoalsService.getGoals(userId);
    }
    return supabaseService.getGoals(userId);
}

export async function createGoal(goal: Omit<GoalInsert, 'id' | 'created_at'>): Promise<Goal> {
    if (isDemoMode()) {
        return mockGoalsService.createGoal(goal);
    }
    return supabaseService.createGoal(goal);
}

export async function updateGoal(id: string, updates: GoalUpdate): Promise<Goal> {
    if (isDemoMode()) {
        return mockGoalsService.updateGoal(id, updates);
    }
    return supabaseService.updateGoal(id, updates);
}

export async function deleteGoal(id: string): Promise<void> {
    if (isDemoMode()) {
        return mockGoalsService.deleteGoal(id);
    }
    return supabaseService.deleteGoal(id);
}

export async function updateGoalProgress(id: string, amount: number): Promise<Goal> {
    if (isDemoMode()) {
        return mockGoalsService.updateGoalProgress(id, amount);
    }
    return supabaseService.updateGoalProgress(id, amount);
}
