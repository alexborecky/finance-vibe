/**
 * Utility to validate environment variables and provide clear error messages.
 */
export function validateEnv() {
    const required = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        const errorMsg = `
❌ Missing required environment variables: ${missing.join(', ')}

Please check your .env.local file. If you haven't set it up yet:
1. Copy .env.local.example to .env.local
2. Fill in the required values from your Supabase dashboard.

Project: Finance Vibe
Docs: https://supabase.com/dashboard
`
        // In development, we want to see this clearly in the console
        if (process.env.NODE_ENV === 'development') {
            console.error(errorMsg)
        }

        return {
            valid: false,
            missing,
            errorMsg
        }
    }

    return {
        valid: true,
        env: required as Record<keyof typeof required, string>
    }
}

export function getRequiredEnv(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Environment variable ${key} is required but missing.`)
    }
    return value
}
