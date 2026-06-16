require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRealUpload() {
    try {
        console.log("🧪 Testing real upload scenario...\n")
        
        // First, create a test profile
        console.log("1. Creating test profile...")
        const testUserId = '12345678-1234-1234-1234-123456789012'
        
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: testUserId,
                email: 'testuser@example.com'
            }])
            .select()
            
        if (profileError) {
            console.log("❌ Profile creation failed:", profileError.message)
        } else {
            console.log("✅ Test profile created")
        }
        
        // Test insert with valid user_id
        console.log("\n2. Testing item insert with valid user_id...")
        const testItem = {
            title: 'Real Upload Test',
            category: 'Electronics',
            description: 'Testing real upload scenario',
            type: 'lost',
            date_time: new Date().toISOString(),
            location_zone: 'Test Zone',
            specific_location: 'Test Location',
            user_id: testUserId
        }
        
        const { data: itemData, error: itemError } = await supabase
            .from('items')
            .insert([testItem])
            .select()
            
        if (itemError) {
            console.log("❌ Item insert failed:", itemError.message)
            console.log("🔧 You still need to run: ALTER TABLE items DROP CONSTRAINT IF EXISTS items_user_id_fkey;")
        } else {
            console.log("✅ Item insert successful! ID:", itemData[0].id)
            
            // Clean up
            await supabase.from('items').delete().eq('id', itemData[0].id)
            await supabase.from('profiles').delete().eq('id', testUserId)
            console.log("✅ Test data cleaned up")
            console.log("\n🎉 Your upload should work now!")
        }
        
    } catch (error) {
        console.error("Test error:", error)
    }
}

testRealUpload()
