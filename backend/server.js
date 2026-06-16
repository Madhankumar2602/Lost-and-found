require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 5000

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(cors())  // Allow all origins — auth is handled client-side via Supabase JS

app.use(express.json())

// --------------------------------------------------
// Supabase Client (Service Role - Backend Only)
// --------------------------------------------------
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// --------------------------------------------------
// Multer (for image uploads)
// --------------------------------------------------
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// --------------------------------------------------
// Health Check
// --------------------------------------------------
app.get("/", (req, res) => {
    res.json({ message: "Lost & Found Backend Running 🚀" })
})


// ==================================================
// 🔐 AUTH ROUTES
// ==================================================

// Signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (error) return res.status(400).json({ error: error.message })

        res.json({ user: data.user })
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 👤 UPDATE PROFILE
// ==================================================
app.put("/api/profile/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { full_name, registration_number, phone } = req.body

        const { data, error } = await supabase
            .from("profiles")
            .update({ full_name, registration_number, phone })
            .eq("id", id)
            .select()

        if (error) return res.status(400).json({ error: error.message })

        res.json(data)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 📦 CREATE ITEM (WITH IMAGE)
// ==================================================
app.post("/api/items", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            type,
            date_time,
            location_zone,
            specific_location,
            user_id,
        } = req.body

        let imageUrl = null

        // If image uploaded
        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop()
            const fileName = `${uuidv4()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("item-images")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                })

            if (uploadError)
                return res.status(400).json({ error: uploadError.message })

            const { data: publicUrl } = supabase.storage
                .from("item-images")
                .getPublicUrl(fileName)

            imageUrl = publicUrl.publicUrl.replace('/storage/v1/object/', '/storage/v1/object/public/')
        }

        const { data, error } = await supabase
            .from("items")
            .insert([
                {
                    title,
                    category,
                    description,
                    type,
                    date_time,
                    location_zone,
                    specific_location,
                    image_url: imageUrl,
                    user_id,
                },
            ])
            .select()

        if (error) return res.status(400).json({ error: error.message })

        res.json(data)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 📦 GET ALL ITEMS
// ==================================================
app.get("/api/items", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) return res.status(400).json({ error: error.message })

        res.json(data)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 📦 GET SINGLE ITEM
// ==================================================
app.get("/api/items/:id", async (req, res) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from("items")
            .select("*")
            .eq("id", id)
            .single()

        if (error) return res.status(400).json({ error: error.message })

        res.json(data)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// ❌ DELETE ITEM
// ==================================================
app.delete("/api/items/:id", async (req, res) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from("items")
            .delete()
            .eq("id", id)

        if (error) return res.status(400).json({ error: error.message })

        res.json({ message: "Item deleted" })
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 📩 CREATE CLAIM
// ==================================================
app.post("/api/claims", async (req, res) => {
    try {
        const { item_id, claimant_id, message } = req.body

        const { data, error } = await supabase
            .from("claims")
            .insert([{ item_id, claimant_id, message }])
            .select()

        if (error) return res.status(400).json({ error: error.message })

        res.json(data)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


// ==================================================
// 🤖 AI IMAGE MATCHING
// ==================================================
const { analyzeImage, findMatches } = require("./utils/ai-matching")

// Analyze an item's image with AI
app.post("/api/items/:id/analyze", async (req, res) => {
    try {
        const { id } = req.params

        const { data: item, error } = await supabase
            .from("items")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !item) return res.status(404).json({ error: "Item not found" })
        if (!item.image_url) return res.status(400).json({ error: "Item has no image" })

        const analysis = await analyzeImage(item.image_url)

        if (!analysis) return res.status(500).json({ error: "AI analysis failed" })

        // Cache the description
        await supabase
            .from("items")
            .update({ ai_description: JSON.stringify(analysis) })
            .eq("id", id)

        res.json({ analysis })
    } catch (err) {
        console.error("Analyze error:", err)
        res.status(500).json({ error: "Server error during analysis" })
    }
})

// Find AI-matched items for a given item
app.get("/api/items/:id/matches", async (req, res) => {
    try {
        const { id } = req.params

        const matches = await findMatches(supabase, id)

        res.json({ matches })
    } catch (err) {
        console.error("Matching error:", err)
        res.status(500).json({ error: err.message || "Server error during matching" })
    }
})


// ==================================================
// 🚀 START SERVER
// ==================================================

// Ensure ai_description column exists
async function ensureAIColumn() {
    try {
        // Try to query the column — if it fails, we'll add it via SQL
        const { error } = await supabase
            .from("items")
            .select("ai_description")
            .limit(1)

        if (error && error.message.includes("ai_description")) {
            console.log("Adding ai_description column to items table...")
            const { error: alterError } = await supabase.rpc("exec_sql", {
                sql: "ALTER TABLE items ADD COLUMN IF NOT EXISTS ai_description TEXT;"
            })
            if (alterError) {
                console.log("Note: Could not auto-add ai_description column. Please add it manually in Supabase dashboard:")
                console.log("  ALTER TABLE items ADD COLUMN ai_description TEXT;")
            }
        }
    } catch (e) {
        // Column likely already exists, which is fine
    }
}

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`)
    await ensureAIColumn()
    console.log("🤖 AI Image Matching enabled")
})
