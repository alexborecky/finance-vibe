-- 1. Ensure columns exist in the public.transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_end_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurring_source_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;

-- 2. Relax the amount constraint to allow 0 or negative values (needed for balance fixes and virtual deletions)
-- First, identify and drop the existing constraint (it might be named differently, but usually table_column_check)
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_amount_check;

-- 3. Verify the changes
-- SELECT * FROM public.transactions LIMIT 1;
