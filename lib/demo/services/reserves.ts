
import { MOCK_RESERVES } from '../mockData';
import { Database } from '@/lib/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export const mockReservesService = {
    getReserves: async (userId: string): Promise<Goal[]> => {
        // We can filter mock goals if we stick to the single source of truth, 
        // but here we used MOCK_RESERVES (which I defined as its own array earlier).
        // I should probably map MOCK_RESERVES to Goal structure or update MOCK_RESERVES to look like Goals.
        // For now, casting is fine as long as fields match enough for UI.
        return MOCK_RESERVES.map(r => ({
            ...r,
            type: 'reserve',
            user_id: userId,
            title: r.name, // Mapping name to title
            target_amount: r.target_amount,
            current_amount: r.current_amount,
            deadline: null,
            saving_strategy: null,
            metadata: null
        })) as unknown as Goal[];
    },

    createReserve: async (reserve: GoalInsert): Promise<Goal> => {
        return {
            ...reserve,
            id: `reserve-${Date.now()}`,
            created_at: new Date().toISOString(),
            current_amount: 0,
        } as Goal;
    },

    updateReserve: async (id: string, updates: GoalUpdate): Promise<Goal> => {
        // Mock update
        return { ...updates, id } as unknown as Goal;
    },

    deleteReserve: async (id: string): Promise<void> => {
        return;
    },

    getEmergencyFundStats: async (userId: string) => {
        return {
            averageMonthlyNeeds: 15000,
            recommended: {
                minTarget: 45000,
                fortress: 90000
            }
        };
    }
};
