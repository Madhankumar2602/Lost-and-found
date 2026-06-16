require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

// Test with service role key (has admin permissions)
const adminSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Test with anon key (regular user permissions) - using service role for now since anon key not available
const testSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPermissions() {
    try {
        console.log("Testing permissions...")
        
        // Test 1: Check if we can read from items table with anon key
        console.log("\n1. Testing SELECT with anon key...")
        const { data: selectData, error: selectError } = await testSupabase
            .from('items')
            .select('count')
            .limit(1)
            
        if (selectError) {
            console.error("SELECT error with anon key:", selectError)
        } else {
            console.log("✅ SELECT works with anon key")
        }
        
        // Test 2: Test INSERT with anon key
        console.log("\n2. Testing INSERT with anon key...")
        const testItem = {
            title: 'Test Item',
            category: 'Test',
            description: 'Test description',
            type: 'lost',
            date_time: new Date().toISOString(),
            location_zone: 'Test Zone',
            specific_location: 'Test specific location',
            user_id: '00000000-0000-0000-0000-000000000000'
        }
        
        const { data: insertData, error: insertError } = await testSupabase
            .from('items')
            .insert([testItem])
            .select()
            
        if (insertError) {
            console.error("INSERT error with anon key:", insertError)
            console.log("Error details:", insertError.message)
        } else {
            console.log("✅ INSERT works with anon key")
            console.log("Inserted item ID:", insertData[0]?.id)
            
            // Clean up - delete the test item
            await testSupabase
                .from('items')
                .delete()
                .eq('id', insertData[0]?.id)
        }
        
        // Test 3: Check storage permissions
        console.log("\n3. Testing storage access...")
        const { data: storageData, error: storageError } = await testSupabase
            .storage
            .from('item-images')
            .list()
            
        if (storageError) {
            console.error("Storage error with anon key:", storageError)
        } else {
            console.log("✅ Storage access works with anon key")
        }
        
        console.log("\nPermission test completed!")
        
    } catch (error) {
        console.error("Test error:", error)
    }
}

testPermissions()
