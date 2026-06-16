import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import ItemDetailsModal from "../components/ItemDetailsModal";
import AIMatchModal from "../components/AIMatchModal";
import CampusHeatmap from "../components/visualization/CampusHeatmap";
import supabase from "../services/supabase";

function Home() {
    const ITEMS_PER_PAGE = 6;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [selectedItem, setSelectedItem] = useState(null);
    const [aiMatchItem, setAiMatchItem] = useState(null);
    const itemsSectionRef = useRef(null);

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setItems(data || []);
        setLoading(false);
    };

    const filteredItems = useMemo(() => {
        return items
            .filter(item => filter === "all" ? true : item.type === filter)
            .filter(item =>
                item.title?.toLowerCase().includes(search.toLowerCase()) ||
                item.location_zone?.toLowerCase().includes(search.toLowerCase())
            );
    }, [items, filter, search]);

    const paginatedItems = filteredItems.slice(0, visibleCount);

    const lostCount  = items.filter(i => i.type === 'lost').length;
    const foundCount = items.filter(i => i.type === 'found').length;

    const handleZoneFilter = (zoneKeyword, type) => {
        setSearch(zoneKeyword);
        setFilter(type);
        setVisibleCount(ITEMS_PER_PAGE);
        // Scroll to items section
        setTimeout(() => {
            itemsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // AI Match handler — takes a raw item (with original fields)
    const handleAIMatch = (rawItem) => {
        // Normalize: if it came from an ItemCard (mapped fields), remap to original
        const item = rawItem.image_url ? rawItem : {
            ...rawItem,
            image_url: rawItem.image,
            location_zone: rawItem.location || rawItem.location_zone,
        };
        setAiMatchItem(item);
    };

    // When user clicks a match result in AIMatchModal, show its details
    const handleViewMatchedItem = (matchedItem) => {
        setAiMatchItem(null);
        setSelectedItem(matchedItem);
    };

    return (
        <>
            {/* ── HERO ── */}
            <section className="hero-section">
                <div className="hero-eyebrow">
                    <span className="dot" /> Live Campus Portal
                </div>
                <h1 className="hero-title">
                    Lost something on campus?<br />
                    <span className="highlight">We'll help you find it.</span>
                </h1>
                <p className="hero-subtitle">
                    SRMIST's official student portal to report and track lost
                    belongings — safe, verified, and community-driven.
                </p>
                <div className="hero-actions">
                    <Link to="/report-lost">
                        <button className="hero-btn-lost">🔍 Report Lost Item</button>
                    </Link>
                    <Link to="/report-found">
                        <button className="hero-btn-found">📦 Report Found Item</button>
                    </Link>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <div className="stat-number">{items.length}</div>
                        <div className="stat-label">Total Reports</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{lostCount}</div>
                        <div className="stat-label">Lost Items</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{foundCount}</div>
                        <div className="stat-label">Found Items</div>
                    </div>
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

                {/* Heatmap */}
                <div className="heatmap-section">
                    <div className="heatmap-header">
                        <span style={{ fontSize: '1.25rem' }}>🗺️</span>
                        <div>
                            <h3>Campus Hotspot Map</h3>
                            <p>Zones with the most reported items</p>
                        </div>
                    </div>
                    <CampusHeatmap items={items} onZoneFilter={handleZoneFilter} />
                </div>

                {/* Search & Filter */}
                <div className="controls-bar" ref={itemsSectionRef}>
                    <div className="search-wrap">
                        <span className="search-icon">🔎</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by item name or location…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                        />
                    </div>
                    <div className="filter-group">
                        {["all", "lost", "found"].map(t => (
                            <button
                                key={t}
                                onClick={() => { setFilter(t); setVisibleCount(ITEMS_PER_PAGE); }}
                                className={`filter-btn ${filter === t ? `active ${t}` : ''}`}
                            >
                                {t === 'all' ? 'All' : t === 'lost' ? '🔍 Lost' : '📦 Found'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section heading */}
                <div className="section-heading">
                    <h2 className="section-title">
                        {filter === 'all' ? 'Recent Reports' : filter === 'lost' ? 'Lost Items' : 'Found Items'}
                    </h2>
                    {!loading && (
                        <span className="section-count">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                {/* Grid */}
                <div className="items-grid">
                    {loading && (
                        <div className="loading-wrap">
                            <div className="spinner" />
                            <span>Loading reports…</span>
                        </div>
                    )}

                    {!loading && paginatedItems.length > 0 && paginatedItems.map(item => (
                        <ItemCard
                            key={item.id}
                            item={{
                                ...item,
                                location: item.location_zone,
                                image: item.image_url,
                                date: item.created_at
                            }}
                            onClick={() => setSelectedItem(item)}
                            onAIMatch={() => handleAIMatch(item)}
                        />
                    ))}

                    {!loading && filteredItems.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🗂️</div>
                            <h3>No items found</h3>
                            <p>Try a different search term or filter.</p>
                        </div>
                    )}
                </div>

                {/* Load more */}
                {visibleCount < filteredItems.length && (
                    <div className="load-more-wrap">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}
                        >
                            Load more reports ↓
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="footer">
                <strong>SRM Lost &amp; Found Portal</strong> — Built for the SRMIST campus community
            </footer>

            {/* Item Details Modal */}
            {selectedItem && (
                <ItemDetailsModal
                    item={{
                        ...selectedItem,
                        location: selectedItem.location_zone,
                        image: selectedItem.image_url,
                        date: selectedItem.created_at
                    }}
                    onClose={() => setSelectedItem(null)}
                    onAIMatch={() => {
                        setSelectedItem(null);
                        handleAIMatch(selectedItem);
                    }}
                />
            )}

            {/* AI Match Modal */}
            {aiMatchItem && (
                <AIMatchModal
                    item={aiMatchItem}
                    onClose={() => setAiMatchItem(null)}
                    onViewItem={handleViewMatchedItem}
                />
            )}
        </>
    );
}

export default Home;
