require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStatus() {
    try {
        console.log("🔍 Checking current database status...\n")
        
        // Test 1: Simple insert without foreign key
        console.log("1. Testing basic insert...")
        const { data: testData, error: testError } = await supabase
            .from('items')
            .insert([{
                title: 'Status Check',
                category: 'Test',
                description: 'Checking status',
                type: 'lost',
                date_time: new Date().toISOString(),
                location_zone: 'Test',
                specific_location: 'Test',
                user_id: null  // Try with null user_id
            }])
            .select()
            
        if (testError) {
            console.log("❌ Basic insert failed:", testError.message)
            console.log("📋 You need to run the SQL fix in Supabase dashboard!")
        } else {
            console.log("✅ Basic insert works!")
            
            // Clean up
            await supabase.from('items').delete().eq('id', testData[0].id)
        }
        
        // Test 2: Check if profiles table exists
        console.log("\n2. Checking profiles table...")
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            
        if (profilesError) {
            console.log("❌ Profiles table missing:", profilesError.message)
        } else {
            console.log("✅ Profiles table exists")
        }
        
        console.log("\n📝 Next steps:")
        console.log("If tests failed, run this SQL in your Supabase SQL Editor:")
        console.log("ALTER TABLE items DISABLE ROW LEVEL SECURITY;")
        console.log("ALTER TABLE items DROP CONSTRAINT IF EXISTS items_user_id_fkey;")
        
    } catch (error) {
        console.error("Status check error:", error)
    }
}

checkStatus()
