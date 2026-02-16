import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

export async function getAssets(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createAsset(asset: Database['public']['Tables']['assets']['Insert']) {
    console.log('[Assets Service] Creating asset:', asset);
    const supabase = createClient();
    const { data, error } = await (supabase as any)
        .from('assets')
        .insert(asset)
        .select()
        .single();

    if (error) {
        console.error('[Assets Service] Error creating asset:', JSON.stringify(error, null, 2));
        throw error;
    }

    if (!data) {
        console.warn('[Assets Service] No data returned from insert');
        throw new Error('Failed to create asset: No data returned from database');
    }

    console.log('[Assets Service] Asset created successfully:', data);
    return data;
}

export async function updateAsset(id: string, updates: Database['public']['Tables']['assets']['Update']) {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteAsset(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
