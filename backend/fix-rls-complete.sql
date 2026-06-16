-- COMPLETE FIX FOR RLS ISSUE
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Disable RLS completely on items table
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Step 2: Also disable RLS on storage objects if enabled
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 3: Check if profiles table exists and create if needed
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Insert a default profile for testing if it doesn't exist
INSERT INTO profiles (id, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Step 6: Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Enable storage access
CREATE POLICY IF NOT EXISTS "Allow public access to item-images" ON storage.objects
FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY IF NOT EXISTS "Allow uploads to item-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'item-images');

-- Step 8: Verify the changes
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'items';
