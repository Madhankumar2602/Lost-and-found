/**
 * LOCAL MATCHING ENGINE — No API Key Required
 *
 * Uses:
 *  1. Image perceptual hashing (via sharp — local, no API)
 *  2. String similarity (Dice coefficient) on titles & descriptions
 *  3. Category, location, and keyword matching
 *  4. Weighted scoring to produce a 0-100 match score
 */

// ─────────────────────────────────────────────────────────────
// 1. STRING SIMILARITY  (Dice Coefficient — no npm needed)
// ─────────────────────────────────────────────────────────────
function getBigrams(str) {
    const bigrams = new Set();
    const s = str.toLowerCase().trim();
    for (let i = 0; i < s.length - 1; i++) {
        bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
}

function diceCoefficient(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const aGrams = getBigrams(a);
    const bGrams = getBigrams(b);
    if (aGrams.size === 0 || bGrams.size === 0) return 0;
    let intersect = 0;
    aGrams.forEach(g => { if (bGrams.has(g)) intersect++; });
    return (2 * intersect) / (aGrams.size + bGrams.size);
}

// Word-level overlap (handles "Certificate of Participation" vs "certificate")
function wordOverlap(a, b) {
    if (!a || !b) return 0;
    const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    const setB = new Set(wordsB);
    const matches = wordsA.filter(w => setB.has(w)).length;
    return matches / Math.max(wordsA.length, wordsB.length);
}

// Combined text similarity (best of dice + word overlap)
function textSimilarity(a, b) {
    if (!a && !b) return 0;
    if (!a || !b) return 0;
    const dice = diceCoefficient(a, b);
    const word = wordOverlap(a, b);
    return Math.max(dice, word);
}

// ─────────────────────────────────────────────────────────────
// 2. IMAGE HASH COMPARISON  (requires sharp — graceful fallback)
// ─────────────────────────────────────────────────────────────
let sharp = null;
try {
    sharp = require("sharp");
} catch {
    console.log("ℹ️  sharp not installed — image hash comparison disabled. Run: npm install sharp");
}

/**
 * Compute a simple 8x8 average-hash of an image URL.
 * Returns a 64-bit binary string or null on failure.
 */
async function computeImageHash(imageUrl) {
    if (!sharp) return null;
    try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Resize to 8x8 greyscale
        const { data } = await sharp(buffer)
            .resize(8, 8, { fit: "fill" })
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        return Array.from(data).map(v => (v >= avg ? "1" : "0")).join("");
    } catch {
        return null;
    }
}

/**
 * Hamming distance between two hash strings → 0..1 similarity
 */
function hashSimilarity(h1, h2) {
    if (!h1 || !h2 || h1.length !== h2.length) return 0;
    let diff = 0;
    for (let i = 0; i < h1.length; i++) {
        if (h1[i] !== h2[i]) diff++;
    }
    // hamming 0 → similarity 1, hamming 64 → similarity 0
    return 1 - diff / h1.length;
}

// ─────────────────────────────────────────────────────────────
// 3. KEYWORD / CATEGORY HELPERS
// ─────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
    "Electronics":              ["phone", "laptop", "charger", "earbuds", "tablet", "watch", "camera", "cable", "headphone", "airpod", "powerbank"],
    "ID Card / Wallet":         ["id", "card", "wallet", "aadhar", "license", "pan", "passport", "certificate", "identity"],
    "Bag / Backpack":           ["bag", "backpack", "sling", "pouch", "handbag", "tote", "luggage"],
    "Keys":                     ["key", "keys", "keychain", "bike", "car", "lock"],
    "Clothing / Accessories":   ["shirt", "jacket", "cap", "hat", "glasses", "spectacles", "belt", "shoes", "sandal", "scarf", "umbrella"],
    "Books / Notes":            ["book", "notebook", "notes", "textbook", "diary", "copy", "register"],
    "Other":                    [],
};

function keywordScore(title, desc, category) {
    const text = `${title} ${desc || ""}`.toLowerCase();
    const keywords = CATEGORY_KEYWORDS[category] || [];
    const matches = keywords.filter(k => text.includes(k)).length;
    return keywords.length > 0 ? Math.min(1, matches / 2) : 0;
}

function getMatchingFeatures(src, cand) {
    const features = [];
    if (src.category === cand.category)       features.push("Same category: " + src.category);
    if (src.location_zone && src.location_zone === cand.location_zone)
                                               features.push("Same location: " + src.location_zone);
    const ts = textSimilarity(src.title, cand.title);
    if (ts > 0.4)                              features.push("Similar title");
    const ds = textSimilarity(src.description, cand.description);
    if (ds > 0.3)                              features.push("Similar description");

    // shared keywords
    const srcWords = new Set((src.title + " " + (src.description || "")).toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const candWords = (`${cand.title} ${cand.description || ""}`).toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const shared = candWords.filter(w => srcWords.has(w));
    if (shared.length > 0) features.push(`Shared keywords: ${[...new Set(shared)].slice(0, 3).join(", ")}`);

    return features;
}

function getConfidence(score) {
    if (score >= 75) return "high";
    if (score >= 50) return "medium";
    return "low";
}

function getMatchReason(score, features, imageSim) {
    if (score >= 80) return `Strong match: ${features[0] || "multiple matching features detected"}.`;
    if (score >= 60) return `Likely match based on ${features.slice(0, 2).join(" and ") || "textual similarity"}.`;
    if (score >= 40) return `Possible match — ${features[0] || "some common attributes found"}.`;
    return `Weak similarity — only minor overlap detected.`;
}

// ─────────────────────────────────────────────────────────────
// 4. CORE LOCAL SCORING FUNCTION
// ─────────────────────────────────────────────────────────────
/**
 * Score a candidate item against the source item locally (no API).
 *
 * Weight breakdown (total = 100):
 *   Image hash similarity  → 40 pts  (if sharp available, else redistributed)
 *   Title similarity       → 25 pts
 *   Category match         → 15 pts
 *   Description similarity → 10 pts
 *   Location zone match    →  7 pts
 *   Keyword overlap        →  3 pts
 */
async function localScoreItems(sourceItem, candidateItem, srcHash) {
    // ── Image hash ──────────────────────────────────────
    let imageScore = 0;
    let imageWeight = sharp ? 40 : 0;

    if (sharp && srcHash) {
        const candHash = await computeImageHash(candidateItem.image_url);
        const sim = hashSimilarity(srcHash, candHash);
        imageScore = sim * imageWeight;
    }

    // Redistribute image weight to text fields if sharp unavailable
    const textBonus = sharp ? 1 : 1.4; // scale up text scores when no image

    // ── Title similarity ────────────────────────────────
    const titleSim = textSimilarity(sourceItem.title, candidateItem.title);
    const titleScore = titleSim * 25 * textBonus;

    // ── Category ────────────────────────────────────────
    const categoryScore = sourceItem.category === candidateItem.category ? 15 * textBonus : 0;

    // ── Description ─────────────────────────────────────
    const descSim = textSimilarity(sourceItem.description, candidateItem.description);
    const descScore = descSim * 10 * textBonus;

    // ── Location zone ───────────────────────────────────
    const locationScore = (sourceItem.location_zone && sourceItem.location_zone === candidateItem.location_zone)
        ? 7 * textBonus : 0;

    // ── Keyword overlap ─────────────────────────────────
    const kw = keywordScore(candidateItem.title, candidateItem.description, sourceItem.category);
    const kwScore = kw * 3 * textBonus;

    const rawScore = imageScore + titleScore + categoryScore + descScore + locationScore + kwScore;
    const finalScore = Math.min(100, Math.round(rawScore));

    return finalScore;
}

// ─────────────────────────────────────────────────────────────
// 5. PUBLIC API  (same interface as before)
// ─────────────────────────────────────────────────────────────

// Safe columns to select
const SAFE_COLUMNS = "id, title, type, category, description, location_zone, specific_location, image_url, user_id, created_at";

async function findMatches(supabase, itemId) {
    // 1. Fetch the source item
    const { data: sourceItem, error: srcErr } = await supabase
        .from("items")
        .select(SAFE_COLUMNS)
        .eq("id", itemId)
        .single();

    if (srcErr || !sourceItem) {
        throw new Error("Source item not found: " + (srcErr?.message || "unknown"));
    }

    if (!sourceItem.image_url) {
        throw new Error("Source item has no image for matching");
    }

    // 2. Pre-compute source image hash (once, reused for all candidates)
    const srcHash = await computeImageHash(sourceItem.image_url);

    // 3. Fetch opposite-type items with images (exclude source)
    const oppositeType = sourceItem.type === "lost" ? "found" : "lost";
    const { data: candidates, error: candErr } = await supabase
        .from("items")
        .select(SAFE_COLUMNS)
        .eq("type", oppositeType)
        .not("image_url", "is", null)
        .neq("id", itemId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (candErr) {
        throw new Error("Failed to fetch candidates: " + candErr.message);
    }

    if (!candidates || candidates.length === 0) {
        return [];
    }

    console.log(`🔍 Matching "${sourceItem.title}" (${sourceItem.type}) against ${candidates.length} ${oppositeType} items — LOCAL mode`);

    // 4. Score each candidate
    const matchPromises = candidates.map(async (candidate) => {
        try {
            const score = await localScoreItems(sourceItem, candidate, srcHash);
            const features = getMatchingFeatures(sourceItem, candidate);
            const confidence = getConfidence(score);
            const reason = getMatchReason(score, features, null);

            return {
                item: candidate,
                similarity_score: score,
                match_reason: reason,
                matching_features: features,
                confidence: confidence,
                match_type: "local",
            };
        } catch (err) {
            console.error(`Error scoring candidate ${candidate.id}:`, err.message);
            return null;
        }
    });

    const results = await Promise.all(matchPromises);

    // 5. Filter (≥45%) and sort — removes noisy low-confidence false positives
    return results
        .filter((r) => r !== null && r.similarity_score >= 45)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 10);
}

// Keep these exports so server.js doesn't break
async function analyzeImage() { return null; }
async function compareItems() { return { similarity_score: 0, match_reason: "N/A", matching_features: [], confidence: "low" }; }
async function compareImages() { return null; }

module.exports = { analyzeImage, compareItems, compareImages, findMatches };
