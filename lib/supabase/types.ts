export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    role: 'superadmin' | 'admin' | 'user'
                    invited_by: string | null
                    income_mode: 'fixed' | 'hourly' | 'manual'
                    income_amount: number | null
                    hourly_rate: number | null
                    hours_per_week: number | null
                    tax_rate: number | null
                    payment_delay: boolean | null
                    preferences: Json | null
                    income_adjustments: Json | null
                    currency: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    role?: 'superadmin' | 'admin' | 'user'
                    invited_by?: string | null
                    income_mode?: 'fixed' | 'hourly' | 'manual'
                    income_amount?: number | null
                    hourly_rate?: number | null
                    hours_per_week?: number | null
                    tax_rate?: number | null
                    payment_delay?: boolean | null
                    preferences?: Json | null
                    income_adjustments?: Json | null
                    currency?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    role?: 'superadmin' | 'admin' | 'user'
                    invited_by?: string | null
                    income_mode?: 'fixed' | 'hourly' | 'manual'
                    income_amount?: number | null
                    hourly_rate?: number | null
                    hours_per_week?: number | null
                    tax_rate?: number | null
                    payment_delay?: boolean | null
                    preferences?: Json | null
                    income_adjustments?: Json | null
                    currency?: string | null
                    created_at?: string
                }
            },
            invitations: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'user'
                    invited_by: string
                    token: string
                    expires_at: string
                    used: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    role?: 'admin' | 'user'
                    invited_by: string
                    token: string
                    expires_at: string
                    used?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'user'
                    invited_by?: string
                    token?: string
                    expires_at?: string
                    used?: boolean
                    created_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    target_amount: number
                    current_amount: number
                    type: 'short-term' | 'long-term'
                    deadline: string | null
                    saving_strategy: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    target_amount: number
                    current_amount?: number
                    type: 'short-term' | 'long-term'
                    deadline?: string | null
                    saving_strategy?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    target_amount?: number
                    current_amount?: number
                    type?: 'short-term' | 'long-term'
                    deadline?: string | null
                    saving_strategy?: string | null
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    category: 'need' | 'want' | 'saving' | 'income'
                    description: string | null
                    date: string
                    is_recurring: boolean
                    recurring_end_date: string | null
                    recurring_source_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    category: 'need' | 'want' | 'saving' | 'income'
                    description?: string | null
                    date?: string
                    is_recurring?: boolean
                    recurring_end_date?: string | null
                    recurring_source_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    category?: 'need' | 'want' | 'saving' | 'income'
                    description?: string | null
                    date?: string
                    is_recurring?: boolean
                    recurring_end_date?: string | null
                    recurring_source_id?: string | null
                    created_at?: string
                }
            }
            assets: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    value: number
                    category: 'property' | 'investment' | 'savings' | 'vehicle' | 'other'
                    interest_rate: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    value: number
                    category: 'property' | 'investment' | 'savings' | 'vehicle' | 'other'
                    interest_rate?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    value?: number
                    category?: 'property' | 'investment' | 'savings' | 'vehicle' | 'other'
                    interest_rate?: number | null
                    created_at?: string
                }
            }
        }
    }
}
