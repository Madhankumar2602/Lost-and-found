require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupStorage() {
    try {
        console.log("Setting up Supabase storage...")
        
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
            console.error("Error listing buckets:", listError)
            return
        }
        
        console.log("Existing buckets:", buckets.map(b => b.name))
        
        // Check if item-images bucket exists
        const itemImagesBucket = buckets.find(b => b.name === 'item-images')
        
        if (!itemImagesBucket) {
            console.log("Creating item-images bucket...")
            
            // Create the bucket
            const { data, error } = await supabase.storage.createBucket('item-images', {
                public: true,
                allowedMimeTypes: ['image/*'],
                fileSizeLimit: 5242880 // 5MB
            })
            
            if (error) {
                console.error("Error creating bucket:", error)
            } else {
                console.log("Bucket created successfully:", data)
            }
        } else {
            console.log("item-images bucket already exists")
        }
        
        // Set up public access policy
        const { error: policyError } = await supabase.storage.from('item-images').createPolicy('public-access', {
            role: 'anon',
            allow: ['SELECT'],
            table: 'objects',
            filter: `bucket_id = 'item-images'`
        })
        
        if (policyError && !policyError.message.includes('already exists')) {
            console.error("Error creating policy:", policyError)
        } else {
            console.log("Public access policy set up")
        }
        
    } catch (error) {
        console.error("Setup error:", error)
    }
}

setupStorage()
