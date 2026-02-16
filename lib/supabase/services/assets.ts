
import { isDemoMode } from '@/lib/utils';
import * as supabaseService from './assets.supabase';
import { mockAssetsService } from '@/lib/demo/services/assets';
import type { Database } from '@/lib/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export async function getAssets(userId: string): Promise<Asset[]> {
    if (isDemoMode()) {
        return mockAssetsService.getAssets(userId);
    }
    return supabaseService.getAssets(userId);
}

export async function createAsset(asset: AssetInsert): Promise<Asset> {
    if (isDemoMode()) {
        return mockAssetsService.createAsset(asset);
    }
    return supabaseService.createAsset(asset);
}

export async function updateAsset(id: string, updates: AssetUpdate): Promise<Asset> {
    if (isDemoMode()) {
        return mockAssetsService.updateAsset(id, updates);
    }
    return supabaseService.updateAsset(id, updates);
}

export async function deleteAsset(id: string): Promise<void> {
    if (isDemoMode()) {
        return mockAssetsService.deleteAsset(id);
    }
    return supabaseService.deleteAsset(id);
}
