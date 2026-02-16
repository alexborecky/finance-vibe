
import { MOCK_ASSETS } from '../mockData';
import { Database } from '@/lib/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export const mockAssetsService = {
    getAssets: async (userId: string): Promise<Asset[]> => {
        return MOCK_ASSETS as unknown as Asset[];
    },

    createAsset: async (asset: AssetInsert): Promise<Asset> => {
        return {
            ...asset,
            id: `asset-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Asset;
    },

    updateAsset: async (id: string, updates: AssetUpdate): Promise<Asset> => {
        const asset = MOCK_ASSETS.find((a) => a.id === id);
        if (!asset) throw new Error('Asset not found');
        return { ...asset, ...updates } as unknown as Asset;
    },

    deleteAsset: async (id: string): Promise<void> => {
        return;
    }
};
