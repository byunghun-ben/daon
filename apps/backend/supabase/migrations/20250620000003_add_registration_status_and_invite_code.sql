-- Add registration_status to users table
ALTER TABLE public.users 
ADD COLUMN registration_status TEXT CHECK (registration_status IN ('incomplete', 'completed')) DEFAULT 'incomplete' NOT NULL;

-- Add invite_code to children table for sharing
ALTER TABLE public.children 
ADD COLUMN invite_code TEXT UNIQUE;

-- Create function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 character alphanumeric code (uppercase)
        code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
        -- Remove characters that might be confusing (0, O, I, 1)
        code := replace(replace(replace(replace(code, '0', '2'), 'O', '3'), 'I', '4'), '1', '5');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.children WHERE invite_code = code) INTO exists;
        
        -- If code doesn't exist, use it
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate invite_code when child is created
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION set_invite_code();

-- Create index for invite_code lookups
CREATE INDEX idx_children_invite_code ON public.children(invite_code);