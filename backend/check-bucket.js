require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkBucket() {
    try {
        console.log("Checking item-images bucket...")
        
        // Get bucket info
        const { data: buckets, error } = await supabase.storage.listBuckets()
        
        if (error) {
            console.error("Error:", error)
            return
        }
        
        const itemImagesBucket = buckets.find(b => b.name === 'item-images')
        console.log("Bucket details:", itemImagesBucket)
        
        // Test public URL generation
        const testFileName = "test.jpg"
        const { data: publicUrl } = supabase.storage
            .from("item-images")
            .getPublicUrl(testFileName)
            
        console.log("Test public URL:", publicUrl.publicUrl)
        
        // Try to list objects
        const { data: objects, error: listError } = await supabase.storage
            .from('item-images')
            .list()
            
        if (listError) {
            console.error("Error listing objects:", listError)
        } else {
            console.log("Objects in bucket:", objects)
        }
        
    } catch (error) {
        console.error("Check error:", error)
    }
}

checkBucket()
