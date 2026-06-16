require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function disableRLS() {
    try {
        console.log("Temporarily disabling RLS for testing...")
        
        // Disable RLS on items table
        const { error: disableError } = await supabase.rpc('exec', {
            sql: 'ALTER TABLE items DISABLE ROW LEVEL SECURITY;'
        })
        
        if (disableError) {
            console.log("Could not disable RLS via RPC, trying direct SQL...")
            // Alternative approach - use raw SQL if available
            console.log("RLS policies might need to be managed via Supabase dashboard")
        }
        
        // Try to create a simple policy that allows everything
        console.log("Creating permissive policies...")
        
        console.log("Please run this SQL in your Supabase SQL Editor:")
        console.log(`
-- Disable RLS temporarily for testing
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, create permissive policies:
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow insert for all users" ON items;
DROP POLICY IF EXISTS "Allow select for all users" ON items;
DROP POLICY IF EXISTS "Allow update for all users" ON items;
DROP POLICY IF EXISTS "Allow delete for all users" ON items;

-- Create permissive policies
CREATE POLICY "Allow insert for all users" ON items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for all users" ON items
FOR SELECT USING (true);

CREATE POLICY "Allow update for all users" ON items
FOR UPDATE USING (true);

CREATE POLICY "Allow delete for all users" ON items
FOR DELETE USING (true);
        `)
        
    } catch (error) {
        console.error("Error:", error)
    }
}

disableRLS()
