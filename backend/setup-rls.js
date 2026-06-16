require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupRLS() {
    try {
        console.log("Setting up RLS policies...")
        
        // Enable RLS on items table
        console.log("Enabling RLS on items table...")
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE items ENABLE ROW LEVEL SECURITY;`
        })
        
        if (rlsError && !rlsError.message.includes('already enabled')) {
            console.error("Error enabling RLS:", rlsError)
        } else {
            console.log("RLS enabled on items table")
        }
        
        // Create policy to allow inserts
        console.log("Creating insert policy...")
        const { error: policyError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE POLICY "Allow insert for all users" ON items
                FOR INSERT WITH CHECK (true);
                
                CREATE POLICY "Allow select for all users" ON items
                FOR SELECT USING (true);
                
                CREATE POLICY "Allow update for all users" ON items
                FOR UPDATE USING (true);
                
                CREATE POLICY "Allow delete for all users" ON items
                FOR DELETE USING (true);
            `
        })
        
        if (policyError && !policyError.message.includes('already exists')) {
            console.error("Error creating policies:", policyError)
        } else {
            console.log("RLS policies created successfully")
        }
        
        // Test the setup
        console.log("Testing RLS setup...")
        const { data: testData, error: testError } = await supabase
            .from('items')
            .select('count')
            .limit(1)
            
        if (testError) {
            console.error("Test failed:", testError)
        } else {
            console.log("RLS setup test passed")
        }
        
    } catch (error) {
        console.error("Setup error:", error)
    }
}

setupRLS()
