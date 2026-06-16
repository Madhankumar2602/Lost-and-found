-- Enable RLS on items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert for all users" ON items;
DROP POLICY IF EXISTS "Allow select for all users" ON items;
DROP POLICY IF EXISTS "Allow update for all users" ON items;
DROP POLICY IF EXISTS "Allow delete for all users" ON items;

-- Create new policies that allow all operations
CREATE POLICY "Allow insert for all users" ON items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for all users" ON items
FOR SELECT USING (true);

CREATE POLICY "Allow update for all users" ON items
FOR UPDATE USING (true);

CREATE POLICY "Allow delete for all users" ON items
FOR DELETE USING (true);

-- Also ensure storage bucket policies are correct
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow image uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'item-images');
