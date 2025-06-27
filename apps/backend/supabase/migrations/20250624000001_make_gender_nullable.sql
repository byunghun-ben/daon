-- Migration: Make gender column nullable in children table
-- This allows for cases where gender is not yet determined (e.g., during pregnancy)
-- Date: 2025-06-24

BEGIN;

-- Make gender column nullable
ALTER TABLE children 
ALTER COLUMN gender DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN children.gender IS 'Child gender - nullable for cases where gender is not yet determined (e.g., during pregnancy or when parents prefer not to specify)';

-- Update any existing policies if needed (optional - depends on current RLS setup)
-- Note: This assumes that gender-based policies (if any) should handle NULL values appropriately

COMMIT;