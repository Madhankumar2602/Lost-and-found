require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAfterFix() {
    try {
        console.log("Testing after RLS fix...")
        
        // Test 1: Check RLS status
        console.log("\n1. Checking RLS status...")
        const { data: rlsStatus, error: rlsError } = await supabase
            .from('pg_tables')
            .select('rowsecurity')
            .eq('schemaname', 'public')
            .eq('tablename', 'items')
            .single()
            
        if (rlsError) {
            console.log("Could not check RLS status (this is normal)")
        } else {
            console.log("RLS status:", rlsStatus.rowsecurity ? "ENABLED" : "DISABLED")
        }
        
        // Test 2: Try to insert a test item
        console.log("\n2. Testing item insertion...")
        const testItem = {
            title: 'Test Upload Fix',
            category: 'Electronics',
            description: 'Testing image upload fix',
            type: 'lost',
            date_time: new Date().toISOString(),
            location_zone: 'Test Zone',
            specific_location: 'Test Location',
            user_id: '00000000-0000-0000-0000-000000000000'
        }
        
        const { data: insertResult, error: insertError } = await supabase
            .from('items')
            .insert([testItem])
            .select()
            
        if (insertError) {
            console.error("❌ Insert still failing:", insertError.message)
        } else {
            console.log("✅ Insert successful! Item ID:", insertResult[0].id)
            
            // Clean up
            await supabase
                .from('items')
                .delete()
                .eq('id', insertResult[0].id)
            console.log("✅ Test item cleaned up")
        }
        
        // Test 3: Test storage access
        console.log("\n3. Testing storage access...")
        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('item-images')
            .list()
            
        if (storageError) {
            console.error("❌ Storage access failing:", storageError.message)
        } else {
            console.log("✅ Storage access working")
        }
        
        console.log("\n🎉 Test completed!")
        
    } catch (error) {
        console.error("Test error:", error)
    }
}

testAfterFix()
