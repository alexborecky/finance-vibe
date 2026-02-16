
import { MOCK_PROFILE } from '../mockData';
import { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const mockProfileService = {
    getProfile: async (userId: string): Promise<Profile | null> => {
        return MOCK_PROFILE as unknown as Profile;
    },

    updateProfile: async (userId: string, updates: ProfileUpdate): Promise<Profile> => {
        return { ...MOCK_PROFILE, ...updates } as unknown as Profile;
    },

    updatePreferences: async (userId: string, preferences: any): Promise<Profile> => {
        return {
            ...MOCK_PROFILE,
            preferences: { ...MOCK_PROFILE.preferences, ...preferences }
        } as unknown as Profile;
    }
};
