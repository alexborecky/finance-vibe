
import { User } from '@supabase/supabase-js';
import { MOCK_USER } from './mockData';

export async function getMockUser(): Promise<User | null> {
    return {
        id: MOCK_USER.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: MOCK_USER.email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmation_sent_at: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {
            provider: 'email',
            providers: ['email'],
        },
        user_metadata: {
            full_name: MOCK_USER.full_name,
            avatar_url: MOCK_USER.avatar_url,
        },
        identities: [],
        created_at: MOCK_USER.created_at,
        updated_at: MOCK_USER.updated_at,
    } as User;
}

export const mockAuthService = {
    getUser: getMockUser,

    signIn: async () => {
        // Simulate sign in delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { user: await getMockUser(), error: null };
    },

    signOut: async () => {
        // In a real app we might clear local storage, but for demo mode
        // we might just reload or do nothing if it's purely state-based.
        // However, the AuthProvider manages the user state, so this mock
        // just needs to return success.
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { error: null };
    }
};
