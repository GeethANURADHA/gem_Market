-- 1. Create gemstone_types table
CREATE TABLE IF NOT EXISTS gemstone_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  img_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create gems table
CREATE TABLE IF NOT EXISTS gems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  carat NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'Precious',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE, -- Can be NULL if adding by email first
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS and setup policies
ALTER TABLE gemstone_types ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read" ON gemstone_types FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert" ON gemstone_types FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public update" ON gemstone_types FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public delete" ON gemstone_types FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE gems ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read" ON gems FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow admin all" ON gems FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read" ON admin_roles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
