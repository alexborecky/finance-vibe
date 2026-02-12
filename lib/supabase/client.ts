import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
    if (client) return client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // In browser, we can't throw a blocking error without breaking the whole app
        // so we return a dummy client or handle it in the UI if needed.
        // But for now, we'll let it fail gracefully if possible or at least not crash the server.
        return createBrowserClient<Database>('', '')
    }

    client = createBrowserClient<Database>(url, key)

    return client
}
