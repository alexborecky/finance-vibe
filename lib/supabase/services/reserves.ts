
import { isDemoMode } from '@/lib/utils';
import * as supabaseService from './reserves.supabase';
import { mockReservesService } from '@/lib/demo/services/reserves';
import type { Database } from '@/lib/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export async function getReserves(userId: string): Promise<Goal[]> {
    if (isDemoMode()) {
        return mockReservesService.getReserves(userId);
    }
    return supabaseService.getReserves(userId);
}

export async function getEmergencyFundStats(userId: string) {
    if (isDemoMode()) {
        return mockReservesService.getEmergencyFundStats(userId);
    }
    return supabaseService.getEmergencyFundStats(userId);
}

export async function createReserve(reserve: GoalInsert): Promise<Goal> {
    if (isDemoMode()) {
        return mockReservesService.createReserve(reserve);
    }
    return supabaseService.createReserve(reserve);
}

export async function updateReserve(id: string, updates: GoalUpdate): Promise<Goal> {
    if (isDemoMode()) {
        return mockReservesService.updateReserve(id, updates);
    }
    return supabaseService.updateReserve(id, updates);
}

export async function deleteReserve(id: string): Promise<void> {
    if (isDemoMode()) {
        return mockReservesService.deleteReserve(id);
    }
    return supabaseService.deleteReserve(id);
}
