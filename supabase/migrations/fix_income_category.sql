-- Migration to add 'income' to the allowed transaction categories

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_category_check;

ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_category_check 
  CHECK (category IN ('need', 'want', 'saving', 'income'));
