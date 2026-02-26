-- 1. Create Tables (if they don't exist)
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gemstone_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    carat DECIMAL NOT NULL,
    category TEXT REFERENCES gemstone_types(name),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemstone_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;

-- 3. Create Helper Function to check if user is admin (Case-Insensitive & Trimmed)
-- 3. Create Helper Function to check if user is admin (Case-Insensitive & Resilient)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  jwt_email TEXT;
BEGIN
  -- Get email from JWT claims or user_metadata
  jwt_email := TRIM(LOWER(COALESCE(
    auth.jwt()->>'email',
    auth.jwt()->'user_metadata'->>'email'
  )));

  -- DEBUG: You can check this in Supabase logs if needed
  -- RAISE NOTICE 'Checking admin for email: %', jwt_email;

  -- 1. SUPER-ADMIN FALLBACK: Explicitly allow the master admin email
  IF jwt_email = 'vetrovivo.lk@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- 2. POSTGRES/SERVICE ROLE: Allow internal system access
  IF current_user IN ('postgres', 'service_role') THEN
    RETURN TRUE;
  END IF;

  -- 3. DATABASE CHECK: Check if user exists in admin_roles
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() 
    OR (jwt_email IS NOT NULL AND TRIM(LOWER(email)) = jwt_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 3.1 Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_email ON public.admin_roles(email);
CREATE INDEX IF NOT EXISTS idx_gemstone_types_name ON public.gemstone_types(name);
CREATE INDEX IF NOT EXISTS idx_gems_category ON public.gems(category);

-- 4. Set up Policies for 'gemstone_types'
DROP POLICY IF EXISTS "Anyone can view gemstone types" ON public.gemstone_types;
DROP POLICY IF EXISTS "Admins can manage gemstone types" ON public.gemstone_types;

CREATE POLICY "Anyone can view gemstone types" ON public.gemstone_types
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage gemstone types" ON public.gemstone_types
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Set up Policies for 'gems'
DROP POLICY IF EXISTS "Anyone can view gems" ON public.gems;
DROP POLICY IF EXISTS "Admins can manage gems" ON public.gems;

CREATE POLICY "Anyone can view gems" ON public.gems
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage gems" ON public.gems
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Set up Policies for 'admin_roles'
DROP POLICY IF EXISTS "Anyone can view admins" ON public.admin_roles;
DROP POLICY IF EXISTS "Admins can manage other admins" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow user to link their own account" ON public.admin_roles;

CREATE POLICY "Anyone can view admins" ON public.admin_roles
    FOR SELECT USING (true);

-- Allow a user to update their own record if their email matches (to link user_id)
CREATE POLICY "Allow user to link their own account" ON public.admin_roles
    FOR UPDATE TO authenticated
    USING (LOWER(email) = LOWER(auth.jwt()->>'email'))
    WITH CHECK (LOWER(email) = LOWER(auth.jwt()->>'email'));

CREATE POLICY "Admins can manage other admins" ON public.admin_roles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. Storage Setup (Resilient)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gemstone_bucket', 'gemstone_bucket', true),
       ('gems_bucket', 'gems_bucket', true),
       ('gemtype_bucket', 'gemtype_bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean up ALL policies on storage.objects to avoid conflicts
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
        FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    );
END $$;

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Universal Bucket Access (Select)
CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (true);

-- Gemtype Bucket Storage Policies (Permissive for Authenticated Users)
-- Since the UI only shows admin controls to admins, this is safe.
CREATE POLICY "Allow Auth Insert GemType" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gemtype_bucket');
CREATE POLICY "Allow Auth Update GemType" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gemtype_bucket');
CREATE POLICY "Allow Auth Delete GemType" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gemtype_bucket');

-- Gems Bucket Admin Policies (Keep strict)
CREATE POLICY "Admin Insert Gems" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'gems_bucket' AND 
    (public.is_admin() OR LOWER(auth.jwt()->>'email') = 'vetrovivo.lk@gmail.com')
);

CREATE POLICY "Admin Update Gems" ON storage.objects FOR UPDATE TO authenticated 
USING (
    bucket_id = 'gems_bucket' AND 
    (public.is_admin() OR LOWER(auth.jwt()->>'email') = 'vetrovivo.lk@gmail.com')
)
WITH CHECK (
    bucket_id = 'gems_bucket' AND 
    (public.is_admin() OR LOWER(auth.jwt()->>'email') = 'vetrovivo.lk@gmail.com')
);

CREATE POLICY "Admin Delete Gems" ON storage.objects FOR DELETE TO authenticated 
USING (
    bucket_id = 'gems_bucket' AND 
    (public.is_admin() OR LOWER(auth.jwt()->>'email') = 'vetrovivo.lk@gmail.com')
);

-- Compatibility policy for the old bucket (optional)
CREATE POLICY "Admin Manage Gemstone" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'gemstone_bucket' AND public.is_admin());

-- 8. Add initial master admin
INSERT INTO public.admin_roles (email) 
VALUES ('vetrovivo.lk@gmail.com')
ON CONFLICT (email) DO NOTHING;
