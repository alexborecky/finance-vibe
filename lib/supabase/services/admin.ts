
import { isDemoMode } from '@/lib/utils';
import * as supabaseService from './admin.supabase';
import { mockAdminService } from '@/lib/demo/services/admin';

export async function getAllUsers() {
    if (isDemoMode()) {
        return mockAdminService.getUsers();
    }
    return supabaseService.getAllUsers();
}

export async function getInvitations(userId: string) {
    if (isDemoMode()) {
        // Mock invites if needed, or return empty
        return [];
    }
    return supabaseService.getInvitations(userId);
}

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
    if (isDemoMode()) {
        return;
    }
    return supabaseService.updateUserRole(userId, role);
}

export async function deleteUser(userId: string) {
    if (isDemoMode()) {
        return;
    }
    return supabaseService.deleteUser(userId);
}
