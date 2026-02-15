-- 1. Update the type check constraint to include 'reserve' and remove 'emergency'/'sinking'
-- We have to migrate existing data first if there is any.
-- Since this is dev, we can update them to 'reserve'.

UPDATE public.goals 
SET type = 'reserve', 
    -- We can store the original type in metadata if we want, but user said they are just templates.
    -- Let's Initialize metadata if null
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('template', type)
WHERE type IN ('emergency', 'sinking');

ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_type_check;

ALTER TABLE public.goals
ADD CONSTRAINT goals_type_check CHECK (type IN ('short-term', 'long-term', 'reserve'));

-- 2. Add metadata column if it doesn't exist (it seems I haven't added it yet in previous steps, 
--    goals table definition in types.ts showed no metadata until now?)
--    Wait, types.ts check:
--    Row 12 etc... no metadata in goals.
--    Transactions has metadata. Goals does not.

ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
