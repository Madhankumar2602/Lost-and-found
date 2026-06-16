import React, { useState, useMemo, useRef, useEffect } from 'react';

/* ─── Zone definitions — all major SRMIST Kattankulathur buildings ────────
   x/y are percentage positions on the 100×100 SVG/overlay canvas.
   building is the footprint rect drawn in SVG coordinate space.
──────────────────────────────────────────────────────────────────────────── */
const ZONE_DEFS = [
    /* ── Academic blocks ── */
    {
        id: 'tp',
        label: 'Tech Park',
        shortLabel: 'TP',
        icon: '🖥️',
        category: 'Academic',
        x: 78, y: 10,
        keywords: ['tech park', 'tech', 'tp block', 'tp'],
        description: 'Engineering & Computing Hub',
        building: { x: 72, y: 5, w: 14, h: 9, rx: 2 },
    },
    {
        id: 'ub',
        label: 'UB Building',
        shortLabel: 'UB',
        icon: '🏛️',
        category: 'Administrative',
        x: 20, y: 28,
        keywords: ['ub', 'university building', 'ub building', 'admin'],
        description: 'Administration & Main Offices',
        building: { x: 13, y: 23, w: 14, h: 9, rx: 2 },
    },
    {
        id: 'biotech',
        label: 'BioTech Block',
        shortLabel: 'BT',
        icon: '🧬',
        category: 'Academic',
        x: 45, y: 12,
        keywords: ['bio', 'biotech', 'bio-tech', 'biotechnology', 'life science'],
        description: 'Life Sciences Department',
        building: { x: 38, y: 7, w: 14, h: 9, rx: 2 },
    },
    {
        id: 'library',
        label: 'Central Library',
        shortLabel: 'LIB',
        icon: '📚',
        category: 'Academic',
        x: 55, y: 28,
        keywords: ['library', 'central library', 'reading room'],
        description: 'Central Library & Study Halls',
        building: { x: 48, y: 22, w: 15, h: 10, rx: 2 },
    },
    {
        id: 'mba',
        label: 'MBA Block',
        shortLabel: 'MBA',
        icon: '💼',
        category: 'Academic',
        x: 30, y: 12,
        keywords: ['mba', 'management', 'business', 'mba block'],
        description: 'School of Management',
        building: { x: 23, y: 7, w: 13, h: 9, rx: 2 },
    },
    {
        id: 'law',
        label: 'Law Block',
        shortLabel: 'LAW',
        icon: '⚖️',
        category: 'Academic',
        x: 62, y: 12,
        keywords: ['law', 'law block', 'school of law'],
        description: 'School of Law',
        building: { x: 55, y: 7, w: 13, h: 9, rx: 2 },
    },
    {
        id: 'dental',
        label: 'Dental College',
        shortLabel: 'DC',
        icon: '🦷',
        category: 'Medical',
        x: 12, y: 47,
        keywords: ['dental', 'dental college', 'dentistry'],
        description: 'SRM Dental College',
        building: { x: 5, y: 42, w: 13, h: 9, rx: 2 },
    },
    {
        id: 'medical',
        label: 'Medical College',
        shortLabel: 'MC',
        icon: '🏥',
        category: 'Medical',
        x: 28, y: 47,
        keywords: ['medical', 'medical college', 'kattankulathur hospital', 'hospital'],
        description: 'SRM Medical College & Hospital',
        building: { x: 21, y: 42, w: 14, h: 9, rx: 2 },
    },
    {
        id: 'pharmacy',
        label: 'Pharmacy Block',
        shortLabel: 'PH',
        icon: '💊',
        category: 'Medical',
        x: 44, y: 47,
        keywords: ['pharmacy', 'pharma', 'pharmacy block'],
        description: 'College of Pharmacy',
        building: { x: 37, y: 42, w: 13, h: 9, rx: 2 },
    },

    /* ── Amenities ── */
    {
        id: 'java',
        label: 'Java Green',
        shortLabel: 'JG',
        icon: '🍽️',
        category: 'Amenity',
        x: 60, y: 47,
        keywords: ['java', 'java green', 'canteen', 'cafeteria', 'food court'],
        description: 'Food Court & Dining Area',
        building: { x: 53, y: 42, w: 13, h: 9, rx: 2 },
    },
    {
        id: 'sports',
        label: 'Sports Complex',
        shortLabel: 'SC',
        icon: '⚽',
        category: 'Amenity',
        x: 20, y: 65,
        keywords: ['sports', 'ground', 'gym', 'playground', 'court', 'cricket', 'football'],
        description: 'Sports Fields & Fitness Centre',
        building: { x: 12, y: 59, w: 16, h: 10, rx: 3 },
    },
    {
        id: 'auditorium',
        label: 'Auditorium',
        shortLabel: 'AUD',
        icon: '🎭',
        category: 'Amenity',
        x: 45, y: 65,
        keywords: ['auditorium', 'audi', 'seminar hall', 'convention'],
        description: 'Main Auditorium & Event Halls',
        building: { x: 38, y: 60, w: 14, h: 9, rx: 2 },
    },
    {
        id: 'atm',
        label: 'ATM & Bank',
        shortLabel: 'ATM',
        icon: '🏧',
        category: 'Amenity',
        x: 76, y: 47,
        keywords: ['atm', 'bank', 'axis bank', 'sbi', 'cash'],
        description: 'Campus ATM & Banking Services',
        building: { x: 70, y: 42, w: 12, h: 8, rx: 2 },
    },
    {
        id: 'hostel_m',
        label: "Men's Hostel",
        shortLabel: 'MH',
        icon: '🏠',
        category: 'Hostel',
        x: 82, y: 65,
        keywords: ['mens hostel', 'men hostel', "male hostel", 'hostel', 'dorm', 'boys hostel'],
        description: "Men's Residence Blocks",
        building: { x: 75, y: 59, w: 14, h: 10, rx: 2 },
    },
    {
        id: 'hostel_w',
        label: "Women's Hostel",
        shortLabel: 'WH',
        icon: '🏡',
        category: 'Hostel',
        x: 63, y: 65,
        keywords: ["womens hostel", "women hostel", "ladies hostel", "girls hostel", 'female dorm'],
        description: "Women's Residence Blocks",
        building: { x: 56, y: 59, w: 14, h: 10, rx: 2 },
    },

    /* ── Gates & transit ── */
    {
        id: 'gate_main',
        label: 'Main Gate',
        shortLabel: 'MG',
        icon: '🚪',
        category: 'Gate',
        x: 10, y: 83,
        keywords: ['main gate', 'gate', 'entrance', 'entry', 'front gate'],
        description: 'Primary Campus Entrance',
        building: { x: 3, y: 78, w: 12, h: 7, rx: 2 },
    },
    {
        id: 'gate_back',
        label: 'Back Gate',
        shortLabel: 'BG',
        icon: '🚧',
        category: 'Gate',
        x: 88, y: 83,
        keywords: ['back gate', 'rear gate', 'second gate', 'side gate'],
        description: 'Secondary Campus Exit',
        building: { x: 81, y: 78, w: 12, h: 7, rx: 2 },
    },
    {
        id: 'bus_stop',
        label: 'Bus Stop & Parking',
        shortLabel: 'BS',
        icon: '🚌',
        category: 'Gate',
        x: 50, y: 83,
        keywords: ['bus stop', 'bus', 'parking', 'transport', 'shuttle'],
        description: 'Campus Transit & Parking Area',
        building: { x: 42, y: 78, w: 16, h: 7, rx: 2 },
    },
];

const CATEGORIES = ['All', 'Academic', 'Medical', 'Amenity', 'Hostel', 'Gate', 'Administrative'];
const CATEGORY_COLORS = {
    Academic:       { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    Administrative: { bg: '#FDF4FF', text: '#9333EA', border: '#E9D5FF' },
    Medical:        { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    Amenity:        { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    Hostel:         { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' },
    Gate:           { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
};

/* ─── Heat colour scale ─────────────────────────────────────────────────── */
function heatColour(count, max) {
    if (max === 0 || count === 0) return { bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', solid: '#64748b', glow: 'rgba(100,116,139,0.22)' };
    const r = count / max;
    if (r >= 0.75) return { bg: 'linear-gradient(135deg,#991b1b,#dc2626)', solid: '#dc2626', glow: 'rgba(220,38,38,0.48)' };
    if (r >= 0.45) return { bg: 'linear-gradient(135deg,#ea580c,#f97316)', solid: '#ea580c', glow: 'rgba(234,88,12,0.42)' };
    if (r >= 0.20) return { bg: 'linear-gradient(135deg,#065f46,#10b981)', solid: '#059669', glow: 'rgba(5,150,105,0.38)' };
    return { bg: 'linear-gradient(135deg,#1e40af,#3b82f6)', solid: '#2563eb', glow: 'rgba(37,99,235,0.32)' };
}

function riskLabel(count, max) {
    if (max === 0 || count === 0) return { text: 'No Activity', color: '#94a3b8' };
    const r = count / max;
    if (r >= 0.75) return { text: 'CRITICAL', color: '#dc2626' };
    if (r >= 0.45) return { text: 'ELEVATED', color: '#ea580c' };
    if (r >= 0.20) return { text: 'MODERATE', color: '#059669' };
    return { text: 'LOW', color: '#2563eb' };
}

/* ─── Main component ─────────────────────────────────────────────────────── */
const CampusHeatmap = ({ items = [], onZoneFilter }) => {
    const [hovered, setHovered]         = useState(null);
    const [pinned, setPinned]           = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [catFilter, setCatFilter]     = useState('All');
    const [dirView, setDirView]         = useState('grid');   // 'grid' | 'list'
    const [searchDir, setSearchDir]     = useState('');
    const tooltipRef = useRef(null);

    /* Close pinned tooltip on outside click */
    useEffect(() => {
        const handle = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setPinned(null);
        };
        if (pinned) document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [pinned]);

    const handleViewItems = (zone, type) => {
        if (onZoneFilter) onZoneFilter(zone.keywords[0], type);
        setPinned(null);
    };

    /* Aggregate counts */
    const zoneCounts = useMemo(() => {
        const map = {};
        ZONE_DEFS.forEach(z => { map[z.id] = { total: 0, lost: 0, found: 0 }; });
        const filtered = activeFilter === 'all' ? items : items.filter(it => it.type === activeFilter);
        filtered.forEach(item => {
            const loc = (item.location_zone || '').toLowerCase();
            for (const zone of ZONE_DEFS) {
                if (zone.keywords.some(kw => loc.includes(kw))) {
                    map[zone.id].total++;
                    if (item.type === 'lost')  map[zone.id].lost++;
                    else if (item.type === 'found') map[zone.id].found++;
                    break;
                }
            }
        });
        return map;
    }, [items, activeFilter]);

    const maxCount  = useMemo(() => Math.max(1, ...Object.values(zoneCounts).map(z => z.total)), [zoneCounts]);
    const topZone   = useMemo(() => {
        let best = null, bestC = 0;
        ZONE_DEFS.forEach(z => { if (zoneCounts[z.id].total > bestC) { bestC = zoneCounts[z.id].total; best = z.label; } });
        return best || '—';
    }, [zoneCounts]);

    /* Directory filter */
    const dirZones = useMemo(() => {
        return ZONE_DEFS.filter(z => {
            const matchCat = catFilter === 'All' || z.category === catFilter;
            const matchQ   = searchDir === '' ||
                z.label.toLowerCase().includes(searchDir.toLowerCase()) ||
                z.description.toLowerCase().includes(searchDir.toLowerCase()) ||
                z.keywords.some(k => k.includes(searchDir.toLowerCase()));
            return matchCat && matchQ;
        });
    }, [catFilter, searchDir]);

    /* Sort so zones with items appear first */
    const sortedDirZones = useMemo(() =>
        [...dirZones].sort((a, b) => (zoneCounts[b.id]?.total || 0) - (zoneCounts[a.id]?.total || 0)),
        [dirZones, zoneCounts]);

    return (
        <div className="chm-root">
            {/* ── Top stats bar ── */}
            <div className="chm-statsbar">
                <div className="chm-stat">
                    <span className="chm-stat-num">{items.length}</span>
                    <span className="chm-stat-label">Total Reports</span>
                </div>
                <div className="chm-stat-divider" />
                <div className="chm-stat">
                    <span className="chm-stat-num" style={{ color: '#dc2626' }}>{items.filter(i => i.type === 'lost').length}</span>
                    <span className="chm-stat-label">Lost Items</span>
                </div>
                <div className="chm-stat-divider" />
                <div className="chm-stat">
                    <span className="chm-stat-num" style={{ color: '#059669' }}>{items.filter(i => i.type === 'found').length}</span>
                    <span className="chm-stat-label">Found Items</span>
                </div>
                <div className="chm-stat-divider" />
                <div className="chm-stat">
                    <span className="chm-stat-num" style={{ color: '#ea580c', fontSize: '0.9rem' }}>{topZone}</span>
                    <span className="chm-stat-label">Hot Zone</span>
                </div>
                <div className="chm-stat-divider" />
                <div className="chm-stat">
                    <span className="chm-stat-num">{ZONE_DEFS.length}</span>
                    <span className="chm-stat-label">Tracked Zones</span>
                </div>

                {/* Filter chips */}
                <div className="chm-filter-chips">
                    {['all', 'lost', 'found'].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`chm-chip ${activeFilter === f ? 'chm-chip--active chm-chip--' + f : ''}`}
                        >
                            {f === 'all' ? '📊 All' : f === 'lost' ? '🔍 Lost' : '📦 Found'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Map canvas ── */}
            <div className="chm-canvas">
                {/* SVG roads & buildings */}
                <svg className="chm-roads" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="#cbd5e1" stopOpacity="0.3" />
                            <stop offset="50%"  stopColor="#cbd5e1" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="roadGradV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#cbd5e1" stopOpacity="0.3" />
                            <stop offset="50%"  stopColor="#cbd5e1" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
                        </linearGradient>
                        <filter id="bShadow" x="-5%" y="-5%" width="115%" height="115%">
                            <feDropShadow dx="0.2" dy="0.4" stdDeviation="0.5" floodOpacity="0.10" />
                        </filter>
                    </defs>

                    {/* Landscaping patches */}
                    <ellipse cx="66" cy="36" rx="4"   ry="3"   fill="#dcfce7" opacity="0.45" />
                    <ellipse cx="12" cy="55" rx="3"   ry="2.5" fill="#dcfce7" opacity="0.35" />
                    <ellipse cx="88" cy="35" rx="4.5" ry="3"   fill="#dcfce7" opacity="0.4"  />
                    <ellipse cx="38" cy="75" rx="6"   ry="3"   fill="#dcfce7" opacity="0.35" />
                    <ellipse cx="72" cy="75" rx="4"   ry="2"   fill="#dcfce7" opacity="0.35" />
                    <ellipse cx="50" cy="55" rx="3"   ry="2.5" fill="#dcfce7" opacity="0.3"  />

                    {/* Main roads */}
                    <path d="M3,38 L97,38"                               stroke="url(#roadGrad)"  strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M3,57 L97,57"                               stroke="url(#roadGrad)"  strokeWidth="3"   fill="none" strokeLinecap="round" />
                    <path d="M3,76 L97,76"                               stroke="url(#roadGrad)"  strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M33,3 L33,97"                               stroke="url(#roadGradV)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                    <path d="M66,3 L66,97"                               stroke="url(#roadGradV)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    {/* Secondary paths */}
                    <path d="M10,20 L90,20" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeDasharray="2,2.5" strokeLinecap="round" />
                    <path d="M50,20 L50,97" stroke="#e2e8f0" strokeWidth="1.2" fill="none" strokeDasharray="2,2"   strokeLinecap="round" />

                    {/* Campus boundary */}
                    <rect x="3" y="3" width="94" height="94" rx="5" stroke="#94a3b8" strokeWidth="0.7" fill="none" strokeDasharray="3,3" opacity="0.5" />

                    {/* Building footprints */}
                    {ZONE_DEFS.map(zone => {
                        const b = zone.building;
                        const cnt = zoneCounts[zone.id];
                        const isActive      = cnt.total > 0;
                        const isHighlighted = hovered === zone.id || pinned === zone.id;
                        const catColor = CATEGORY_COLORS[zone.category] || CATEGORY_COLORS['Gate'];
                        return (
                            <g key={zone.id + '-bldg'} filter="url(#bShadow)">
                                <rect
                                    x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx}
                                    fill={isHighlighted ? catColor.bg : isActive ? '#f0f4ff' : '#f8fafc'}
                                    stroke={isHighlighted ? catColor.text : isActive ? '#a5b4fc' : '#cbd5e1'}
                                    strokeWidth={isHighlighted ? '0.9' : '0.5'}
                                    style={{ transition: 'all 0.2s ease' }}
                                />
                                <text
                                    x={b.x + b.w / 2} y={b.y + b.h + 3.5}
                                    fontSize="2.4" fill={isHighlighted ? catColor.text : '#64748b'}
                                    textAnchor="middle" fontWeight={isHighlighted ? '700' : '500'}
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    {zone.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Compass */}
                    <g transform="translate(93,8)">
                        <circle cx="0" cy="0" r="3.5" fill="white" stroke="#94a3b8" strokeWidth="0.5" opacity="0.8" />
                        <text x="0" y="-0.3" fontSize="2.8" fill="#475569" textAnchor="middle" fontWeight="700">N</text>
                        <path d="M0,-3 L0.6,-1.5 L0,-2 L-0.6,-1.5 Z" fill="#ef4444" />
                    </g>
                </svg>

                {/* Hotspot bubbles */}
                {ZONE_DEFS.map(zone => {
                    const cnt = zoneCounts[zone.id];
                    const { bg, solid, glow } = heatColour(cnt.total, maxCount);
                    const size = 28 + Math.min(cnt.total / Math.max(maxCount, 1), 1) * 22;
                    const isHot = cnt.total > 0;
                    const isHov = hovered === zone.id;
                    const showTooltip = pinned === zone.id || (isHov && pinned === null);

                    return (
                        <div
                            key={zone.id}
                            ref={pinned === zone.id ? tooltipRef : null}
                            className={`chm-hotspot ${isHot ? 'chm-hotspot--active' : ''} ${isHov || pinned === zone.id ? 'chm-hotspot--hovered' : ''}`}
                            style={{
                                left: `${zone.x}%`,
                                top:  `${zone.y}%`,
                                width:  `${size}px`,
                                height: `${size}px`,
                                background: bg,
                                boxShadow: `0 0 0 4px ${glow}, 0 0 18px ${glow}`,
                            }}
                            onMouseEnter={() => setHovered(zone.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => setPinned(pinned === zone.id ? null : zone.id)}
                        >
                            {isHot && <div className="chm-pulse-ring" style={{ borderColor: solid }} />}
                            <span className="chm-hotspot-label">{isHot ? cnt.total : zone.shortLabel}</span>

                            {/* Tooltip */}
                            {showTooltip && (
                                <div className={`chm-tooltip ${pinned === zone.id ? 'chm-tooltip--pinned' : ''}`}>
                                    <div className="chm-tooltip-header">
                                        <span className="chm-tooltip-icon">{zone.icon}</span>
                                        <div>
                                            <div className="chm-tooltip-name">{zone.label}</div>
                                            <div className="chm-tooltip-desc">{zone.description}</div>
                                        </div>
                                    </div>
                                    <div className="chm-tooltip-cat-badge" style={{
                                        background: CATEGORY_COLORS[zone.category]?.bg,
                                        color: CATEGORY_COLORS[zone.category]?.text,
                                        border: `1px solid ${CATEGORY_COLORS[zone.category]?.border}`,
                                    }}>
                                        {zone.category}
                                    </div>
                                    <div className="chm-tooltip-divider" />
                                    <div className="chm-tooltip-row"><span>Total</span><strong>{cnt.total}</strong></div>
                                    <div className="chm-tooltip-row" style={{ color: '#ef4444' }}><span>🔍 Lost</span><strong>{cnt.lost}</strong></div>
                                    <div className="chm-tooltip-row" style={{ color: '#10b981' }}><span>📦 Found</span><strong>{cnt.found}</strong></div>
                                    <div className="chm-tooltip-risk" style={{ color: riskLabel(cnt.total, maxCount).color }}>
                                        {riskLabel(cnt.total, maxCount).text}
                                    </div>
                                    {pinned === zone.id && cnt.total > 0 && (
                                        <div className="chm-tooltip-actions">
                                            {cnt.lost > 0 && (
                                                <button className="chm-tooltip-btn chm-tooltip-btn--lost"
                                                    onClick={e => { e.stopPropagation(); handleViewItems(zone, 'lost'); }}>
                                                    🔍 View Lost ({cnt.lost})
                                                </button>
                                            )}
                                            {cnt.found > 0 && (
                                                <button className="chm-tooltip-btn chm-tooltip-btn--found"
                                                    onClick={e => { e.stopPropagation(); handleViewItems(zone, 'found'); }}>
                                                    📦 View Found ({cnt.found})
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {pinned !== zone.id && cnt.total > 0 && (
                                        <div className="chm-tooltip-hint">Click to view items</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Legend ── */}
            <div className="chm-legend">
                <span className="chm-legend-title">Risk Assessment</span>
                {[
                    { color: '#dc2626', label: 'Critical' },
                    { color: '#ea580c', label: 'Elevated' },
                    { color: '#059669', label: 'Moderate' },
                    { color: '#2563eb', label: 'Low' },
                    { color: '#64748b', label: 'No Activity' },
                ].map(item => (
                    <div key={item.label} className="chm-legend-item">
                        <span className="chm-legend-dot" style={{ background: item.color }} />
                        <span>{item.label}</span>
                    </div>
                ))}
                <div className="chm-legend-divider" />
                <span className="chm-legend-hint">Click zones for details • Hover to preview</span>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                PLACES DIRECTORY
            ═══════════════════════════════════════════════════════════ */}
            <div className="chm-dir">
                {/* Header */}
                <div className="chm-dir-header">
                    <div className="chm-dir-header-left">
                        <span className="chm-dir-header-icon">📍</span>
                        <div>
                            <h3 className="chm-dir-title">Campus Places Directory</h3>
                            <p className="chm-dir-subtitle">All {ZONE_DEFS.length} tracked zones across SRMIST Kattankulathur</p>
                        </div>
                    </div>
                    <div className="chm-dir-header-right">
                        {/* View toggle */}
                        <div className="chm-dir-view-toggle">
                            <button
                                className={`chm-dir-view-btn ${dirView === 'grid' ? 'chm-dir-view-btn--active' : ''}`}
                                onClick={() => setDirView('grid')} title="Grid view"
                            >⊞</button>
                            <button
                                className={`chm-dir-view-btn ${dirView === 'list' ? 'chm-dir-view-btn--active' : ''}`}
                                onClick={() => setDirView('list')} title="List view"
                            >☰</button>
                        </div>
                    </div>
                </div>

                {/* Controls: search + category chips */}
                <div className="chm-dir-controls">
                    <div className="chm-dir-search-wrap">
                        <span className="chm-dir-search-icon">🔎</span>
                        <input
                            className="chm-dir-search"
                            placeholder="Search places…"
                            value={searchDir}
                            onChange={e => setSearchDir(e.target.value)}
                        />
                    </div>
                    <div className="chm-dir-cat-chips">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`chm-dir-cat-chip ${catFilter === cat ? 'chm-dir-cat-chip--active' : ''}`}
                                style={catFilter === cat && cat !== 'All' ? {
                                    background: CATEGORY_COLORS[cat]?.bg,
                                    color:      CATEGORY_COLORS[cat]?.text,
                                    borderColor:CATEGORY_COLORS[cat]?.border,
                                } : {}}
                                onClick={() => setCatFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zone count */}
                <div className="chm-dir-count">
                    Showing <strong>{sortedDirZones.length}</strong> of {ZONE_DEFS.length} locations
                </div>

                {/* Grid / List */}
                {dirView === 'grid' ? (
                    <div className="chm-dir-grid">
                        {sortedDirZones.map(zone => {
                            const cnt = zoneCounts[zone.id];
                            const catC = CATEGORY_COLORS[zone.category] || CATEGORY_COLORS['Gate'];
                            const { solid } = heatColour(cnt.total, maxCount);
                            const risk = riskLabel(cnt.total, maxCount);
                            return (
                                <div
                                    key={zone.id}
                                    className="chm-dir-card"
                                    onClick={() => { setPinned(zone.id); }}
                                >
                                    {/* Top accent bar */}
                                    <div className="chm-dir-card-accent" style={{ background: catC.text }} />

                                    {/* Icon + category */}
                                    <div className="chm-dir-card-top">
                                        <div className="chm-dir-card-icon" style={{ background: catC.bg, color: catC.text }}>
                                            {zone.icon}
                                        </div>
                                        <span className="chm-dir-card-cat" style={{ background: catC.bg, color: catC.text, borderColor: catC.border }}>
                                            {zone.category}
                                        </span>
                                    </div>

                                    {/* Name & desc */}
                                    <div className="chm-dir-card-name">{zone.label}</div>
                                    <div className="chm-dir-card-desc">{zone.description}</div>

                                    {/* Keywords */}
                                    <div className="chm-dir-card-keywords">
                                        {zone.keywords.slice(0, 3).map(k => (
                                            <span key={k} className="chm-dir-card-kw">{k}</span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="chm-dir-card-stats">
                                        <div className="chm-dir-card-stat chm-dir-card-stat--lost">
                                            <span>🔍</span>
                                            <strong>{cnt.lost}</strong>
                                            <span>Lost</span>
                                        </div>
                                        <div className="chm-dir-card-stat chm-dir-card-stat--found">
                                            <span>📦</span>
                                            <strong>{cnt.found}</strong>
                                            <span>Found</span>
                                        </div>
                                        <div className="chm-dir-card-stat">
                                            <span>📊</span>
                                            <strong>{cnt.total}</strong>
                                            <span>Total</span>
                                        </div>
                                    </div>

                                    {/* Risk badge */}
                                    {cnt.total > 0 && (
                                        <div className="chm-dir-card-risk" style={{ color: risk.color, borderColor: solid + '55', background: solid + '11' }}>
                                            {risk.text}
                                        </div>
                                    )}

                                    {/* CTA */}
                                    {cnt.total > 0 && (
                                        <div className="chm-dir-card-actions">
                                            {cnt.lost > 0 && (
                                                <button className="chm-dir-card-btn chm-dir-card-btn--lost"
                                                    onClick={e => { e.stopPropagation(); handleViewItems(zone, 'lost'); }}>
                                                    View Lost →
                                                </button>
                                            )}
                                            {cnt.found > 0 && (
                                                <button className="chm-dir-card-btn chm-dir-card-btn--found"
                                                    onClick={e => { e.stopPropagation(); handleViewItems(zone, 'found'); }}>
                                                    View Found →
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="chm-dir-list">
                        {/* List header */}
                        <div className="chm-dir-list-header">
                            <span style={{ flex: 2 }}>Location</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Category</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Lost</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Found</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Total</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Status</span>
                        </div>
                        {sortedDirZones.map((zone, idx) => {
                            const cnt = zoneCounts[zone.id];
                            const catC = CATEGORY_COLORS[zone.category] || CATEGORY_COLORS['Gate'];
                            const risk = riskLabel(cnt.total, maxCount);
                            return (
                                <div
                                    key={zone.id}
                                    className={`chm-dir-list-row ${idx % 2 === 1 ? 'chm-dir-list-row--alt' : ''}`}
                                    onClick={() => { if (cnt.total > 0) handleViewItems(zone, 'all'); }}
                                    style={{ cursor: cnt.total > 0 ? 'pointer' : 'default' }}
                                >
                                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                        <div className="chm-dir-list-icon" style={{ background: catC.bg, color: catC.text }}>
                                            {zone.icon}
                                        </div>
                                        <div>
                                            <div className="chm-dir-list-name">{zone.label}</div>
                                            <div className="chm-dir-list-desc">{zone.description}</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <span className="chm-dir-card-cat" style={{ background: catC.bg, color: catC.text, borderColor: catC.border }}>
                                            {zone.category}
                                        </span>
                                    </div>
                                    <div className="chm-dir-list-num" style={{ flex: 1, color: '#dc2626' }}>{cnt.lost}</div>
                                    <div className="chm-dir-list-num" style={{ flex: 1, color: '#059669' }}>{cnt.found}</div>
                                    <div className="chm-dir-list-num" style={{ flex: 1 }}>{cnt.total}</div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <span className="chm-dir-list-risk" style={{ color: risk.color }}>
                                            {risk.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusHeatmap;