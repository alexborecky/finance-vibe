-- Add new types to goals table
ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_type_check;

ALTER TABLE public.goals
ADD CONSTRAINT goals_type_check CHECK (type IN ('short-term', 'long-term', 'emergency', 'sinking'));
