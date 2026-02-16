
import { Database } from '@/lib/supabase/types';

// Minimal admin service for demo mode
// Admin features likely won't be fully usable in demo mode or will just show empty/mock lists

export const mockAdminService = {
    getUsers: async () => {
        return [];
    },

    inviteUser: async (email: string) => {
        return { id: 'mock-invite-id', email, created_at: new Date().toISOString() };
    }
};
