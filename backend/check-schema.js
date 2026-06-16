require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
    try {
        console.log("Checking database schema...")
        
        // Get table info
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            
        if (tablesError) {
            console.error("Error getting tables:", tablesError)
        } else {
            console.log("Tables:", tables.map(t => t.table_name))
        }
        
        // Get column info for items table
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', 'items')
            .order('ordinal_position')
            
        if (columnsError) {
            console.error("Error getting columns:", columnsError)
        } else {
            console.log("\nItems table columns:")
            columns.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`)
            })
        }
        
    } catch (error) {
        console.error("Schema check error:", error)
    }
}

checkSchema()
