-- Add OAuth provider information to users table for Kakao login integration
-- This migration adds columns to track OAuth provider information

-- Add OAuth provider columns
ALTER TABLE public.users 
ADD COLUMN oauth_provider TEXT,
ADD COLUMN oauth_provider_id TEXT;

-- Add index for OAuth lookups (provider + provider_id combination)
-- This is essential for performance when looking up users by OAuth info
CREATE INDEX idx_users_oauth_provider ON public.users(oauth_provider, oauth_provider_id);

-- Add unique constraint to prevent duplicate OAuth accounts
-- A user from a specific provider should only have one account
CREATE UNIQUE INDEX idx_users_oauth_unique ON public.users(oauth_provider, oauth_provider_id) 
WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.users.oauth_provider IS 'OAuth provider name (kakao, google, apple, etc.). NULL for email/password accounts.';
COMMENT ON COLUMN public.users.oauth_provider_id IS 'Unique user ID from OAuth provider. NULL for email/password accounts.';

-- Add check constraints for data integrity
ALTER TABLE public.users 
ADD CONSTRAINT check_oauth_provider_values 
CHECK (oauth_provider IS NULL OR oauth_provider IN ('kakao', 'google', 'apple', 'facebook'));

-- Ensure that if oauth_provider is set, oauth_provider_id must also be set and vice versa
ALTER TABLE public.users 
ADD CONSTRAINT check_oauth_consistency 
CHECK (
  (oauth_provider IS NULL AND oauth_provider_id IS NULL) OR 
  (oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL)
);