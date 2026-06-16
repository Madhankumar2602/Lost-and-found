import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AIMatchModal = ({ item, onClose, onViewItem }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scanPhase, setScanPhase] = useState(0);

    const scanMessages = [
        "Initializing AI vision engine…",
        "Analyzing image features & colors…",
        "Scanning database for visual matches…",
        "Comparing distinguishing features…",
        "Ranking results by similarity…"
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setScanPhase(p => (p + 1) % scanMessages.length);
            }, 2200);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        fetchMatches();
    }, [item.id]);

    const fetchMatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.get(`/items/${item.id}/matches`);
            setMatches(res.data.matches || []);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to find matches. Please try again.");
        }
        setLoading(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        if (score >= 40) return '#3B82F6';
        return '#94A3B8';
    };

    const getConfidenceLabel = (confidence) => {
        switch (confidence) {
            case 'high': return { text: 'High Match', color: '#10B981', bg: '#ECFDF5' };
            case 'medium': return { text: 'Possible Match', color: '#F59E0B', bg: '#FFFBEB' };
            default: return { text: 'Low Match', color: '#94A3B8', bg: '#F8FAFC' };
        }
    };

    return (
        <>
            <style>{`
                .aim-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,.65);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: aimFadeIn .3s ease;
                }
                @keyframes aimFadeIn { from { opacity:0 } to { opacity:1 } }

                .aim-modal {
                    background: var(--surface, #fff);
                    border-radius: 24px;
                    width: 100%; max-width: 780px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.1);
                    animation: aimSlideUp .4s cubic-bezier(.16,1,.3,1);
                }
                @keyframes aimSlideUp { from { transform:translateY(30px); opacity:0 } to { transform:translateY(0); opacity:1 } }

                .aim-header {
                    padding: 1.75rem 2rem 1.25rem;
                    border-bottom: 1px solid var(--border, #E2E8F0);
                    display: flex; align-items: center; justify-content: space-between;
                }
                .aim-header-left { display: flex; align-items: center; gap: .75rem; }
                .aim-ai-icon {
                    width: 44px; height: 44px; border-radius: 14px;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.3rem;
                    box-shadow: 0 4px 14px rgba(99,102,241,.35);
                    animation: aimPulse 2s ease-in-out infinite;
                }
                @keyframes aimPulse {
                    0%,100% { box-shadow: 0 4px 14px rgba(99,102,241,.35) }
                    50% { box-shadow: 0 4px 24px rgba(99,102,241,.55) }
                }
                .aim-header h2 {
                    font-family: var(--font-display, inherit);
                    font-size: 1.35rem; font-weight: 700;
                    color: var(--n800, #1E293B);
                    letter-spacing: -.02em;
                }
                .aim-header-sub { font-size: .82rem; color: var(--n500, #64748B); margin-top: .15rem; }
                .aim-close {
                    width: 38px; height: 38px; border-radius: 50%;
                    border: 1.5px solid var(--n200, #E2E8F0);
                    background: var(--n50, #F8FAFC);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 1.1rem; color: var(--n500, #64748B);
                    transition: all .2s;
                }
                .aim-close:hover { background: var(--n100, #F1F5F9); border-color: var(--n300, #CBD5E1); }

                /* Source item strip */
                .aim-source {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #F8FAFC, #EEF2FF);
                    border-bottom: 1px solid var(--border, #E2E8F0);
                }
                .aim-source-img {
                    width: 56px; height: 56px; border-radius: 12px;
                    object-fit: cover;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,.1);
                }
                .aim-source-info { flex: 1; min-width: 0; }
                .aim-source-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #6366F1; margin-bottom: .15rem; }
                .aim-source-title { font-weight: 600; color: var(--n800, #1E293B); font-size: .95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .aim-source-meta { font-size: .8rem; color: var(--n500, #64748B); }

                /* Loading state */
                .aim-loading {
                    padding: 4rem 2rem;
                    display: flex; flex-direction: column;
                    align-items: center; gap: 1.5rem;
                }
                .aim-scanner {
                    width: 100px; height: 100px; position: relative;
                }
                .aim-scanner-ring {
                    position: absolute; inset: 0;
                    border: 3px solid #E2E8F0;
                    border-top-color: #6366F1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg) } }
                .aim-scanner-ring:nth-child(2) {
                    inset: 10px;
                    border-color: #F1F5F9;
                    border-top-color: #8B5CF6;
                    animation-direction: reverse;
                    animation-duration: 1.5s;
                }
                .aim-scanner-core {
                    position: absolute; inset: 22px;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                    animation: aimPulse 2s ease-in-out infinite;
                }
                .aim-scan-text {
                    font-size: .95rem; font-weight: 500; color: var(--n600, #475569);
                    text-align: center;
                    animation: aimFadeText .5s ease;
                }
                @keyframes aimFadeText { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
                .aim-scan-dots {
                    display: flex; gap: .5rem;
                }
                .aim-scan-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: #CBD5E1;
                    animation: aimDotPulse 1.4s ease-in-out infinite;
                }
                .aim-scan-dot:nth-child(2) { animation-delay: .2s; }
                .aim-scan-dot:nth-child(3) { animation-delay: .4s; }
                @keyframes aimDotPulse {
                    0%,100% { background: #CBD5E1; transform: scale(1); }
                    50% { background: #6366F1; transform: scale(1.3); }
                }

                /* Results */
                .aim-results { padding: 1.5rem 2rem 2rem; }
                .aim-results-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .aim-results-title { font-size: .95rem; font-weight: 700; color: var(--n800, #1E293B); }
                .aim-results-count {
                    font-size: .8rem; font-weight: 600;
                    background: #EEF2FF; color: #6366F1;
                    padding: .25rem .75rem; border-radius: 999px;
                }

                .aim-match-card {
                    display: flex; gap: 1rem;
                    padding: 1.1rem;
                    border: 1.5px solid var(--border, #E2E8F0);
                    border-radius: 16px;
                    margin-bottom: .85rem;
                    cursor: pointer;
                    transition: all .25s;
                    background: white;
                    animation: aimCardIn .4s ease both;
                }
                .aim-match-card:hover {
                    border-color: #C7D2FE;
                    box-shadow: 0 4px 16px rgba(99,102,241,.12);
                    transform: translateY(-2px);
                }
                @keyframes aimCardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

                .aim-match-img-wrap {
                    width: 90px; height: 90px; border-radius: 12px;
                    overflow: hidden; flex-shrink: 0;
                    position: relative;
                }
                .aim-match-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .aim-match-score-badge {
                    position: absolute; bottom: 4px; right: 4px;
                    font-size: .7rem; font-weight: 800;
                    padding: .15rem .45rem; border-radius: 6px;
                    color: white;
                    backdrop-filter: blur(4px);
                }

                .aim-match-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
                .aim-match-top { display: flex; align-items: center; gap: .5rem; margin-bottom: .35rem; flex-wrap: wrap; }
                .aim-match-title { font-weight: 600; font-size: .95rem; color: var(--n800, #1E293B); }
                .aim-match-conf {
                    font-size: .7rem; font-weight: 700;
                    padding: .15rem .5rem; border-radius: 999px;
                    text-transform: uppercase; letter-spacing: .04em;
                }
                .aim-match-reason { font-size: .82rem; color: var(--n500, #64748B); line-height: 1.4; margin-bottom: .5rem; }
                .aim-match-features { display: flex; gap: .35rem; flex-wrap: wrap; }
                .aim-match-feature {
                    font-size: .72rem; font-weight: 500;
                    padding: .15rem .5rem; border-radius: 6px;
                    background: #F1F5F9; color: #475569;
                }

                /* Similarity bar */
                .aim-sim-bar-wrap {
                    display: flex; align-items: center; gap: .6rem; margin-top: .35rem;
                }
                .aim-sim-bar-bg {
                    flex: 1; height: 6px; border-radius: 999px;
                    background: #F1F5F9; overflow: hidden;
                }
                .aim-sim-bar-fill {
                    height: 100%; border-radius: 999px;
                    transition: width 1s cubic-bezier(.16,1,.3,1);
                    animation: aimBarGrow 1s cubic-bezier(.16,1,.3,1) both;
                }
                @keyframes aimBarGrow { from { width: 0% } }
                .aim-sim-pct { font-size: .82rem; font-weight: 700; min-width: 36px; text-align: right; }

                /* Empty state */
                .aim-empty {
                    padding: 3.5rem 2rem;
                    display: flex; flex-direction: column;
                    align-items: center; text-align: center;
                }
                .aim-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: .7; }
                .aim-empty h3 { font-size: 1.2rem; font-weight: 700; color: var(--n700, #334155); margin-bottom: .4rem; }
                .aim-empty p { font-size: .9rem; color: var(--n500, #64748B); max-width: 340px; line-height: 1.5; }

                /* Error state */
                .aim-error {
                    padding: 3rem 2rem; text-align: center;
                }
                .aim-error-icon { font-size: 3rem; margin-bottom: .75rem; }
                .aim-error h3 { font-size: 1.1rem; color: #EF4444; font-weight: 700; margin-bottom: .4rem; }
                .aim-error p { font-size: .85rem; color: var(--n500, #64748B); margin-bottom: 1.25rem; }
                .aim-retry-btn {
                    padding: .65rem 1.5rem; border-radius: 999px;
                    font-weight: 700; font-size: .85rem;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    color: white; border: none; cursor: pointer;
                    transition: all .2s;
                    box-shadow: 0 4px 14px rgba(99,102,241,.3);
                }
                .aim-retry-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,.4); }

                /* Scrollbar */
                .aim-modal::-webkit-scrollbar { width: 6px; }
                .aim-modal::-webkit-scrollbar-track { background: transparent; }
                .aim-modal::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 999px; }
            `}</style>

            <div className="aim-overlay" onClick={onClose}>
                <div className="aim-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="aim-header">
                        <div className="aim-header-left">
                            <div className="aim-ai-icon">🤖</div>
                            <div>
                                <h2>AI Image Matching</h2>
                                <div className="aim-header-sub">Image Hash · Text Similarity · Category Matching</div>
                            </div>
                        </div>
                        <button className="aim-close" onClick={onClose}>✕</button>
                    </div>

                    {/* Source item */}
                    <div className="aim-source">
                        {item.image_url ? (
                            <img src={item.image_url} alt="" className="aim-source-img" />
                        ) : (
                            <div className="aim-source-img" style={{ background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {item.type === 'lost' ? '🔍' : '📦'}
                            </div>
                        )}
                        <div className="aim-source-info">
                            <div className="aim-source-label">Searching matches for</div>
                            <div className="aim-source-title">{item.title}</div>
                            <div className="aim-source-meta">
                                {item.category} · {item.location_zone || 'Unknown'} · {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="aim-loading">
                            <div className="aim-scanner">
                                <div className="aim-scanner-ring" />
                                <div className="aim-scanner-ring" />
                                <div className="aim-scanner-core">🔬</div>
                            </div>
                            <div className="aim-scan-text" key={scanPhase}>
                                {scanMessages[scanPhase]}
                            </div>
                            <div className="aim-scan-dots">
                                <div className="aim-scan-dot" />
                                <div className="aim-scan-dot" />
                                <div className="aim-scan-dot" />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="aim-error">
                            <div className="aim-error-icon">⚠️</div>
                            <h3>Matching Failed</h3>
                            <p>{error}</p>
                            <button className="aim-retry-btn" onClick={fetchMatches}>
                                🔄 Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && matches.length === 0 && (
                        <div className="aim-empty">
                            <div className="aim-empty-icon">🔍</div>
                            <h3>No Matches Found</h3>
                            <p>
                                We couldn't find any visually similar {item.type === 'lost' ? 'found' : 'lost'} items right now. 
                                Check back later as new reports come in!
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && !error && matches.length > 0 && (
                        <div className="aim-results">
                            <div className="aim-results-header">
                                <span className="aim-results-title">Potential Matches</span>
                                <span className="aim-results-count">{matches.length} found</span>
                            </div>

                            {matches.map((match, idx) => {
                                const scoreColor = getScoreColor(match.similarity_score);
                                const conf = getConfidenceLabel(match.confidence);
                                return (
                                    <div
                                        key={match.item.id}
                                        className="aim-match-card"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                        onClick={() => onViewItem && onViewItem(match.item)}
                                    >
                                        <div className="aim-match-img-wrap">
                                            {match.item.image_url ? (
                                                <img src={match.item.image_url} alt="" className="aim-match-img" />
                                            ) : (
                                                <div className="aim-match-img" style={{ background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📷</div>
                                            )}
                                            <div className="aim-match-score-badge" style={{ background: scoreColor }}>
                                                {match.similarity_score}%
                                            </div>
                                        </div>

                                        <div className="aim-match-info">
                                            <div className="aim-match-top">
                                                <span className="aim-match-title">{match.item.title}</span>
                                                <span className="aim-match-conf" style={{ color: conf.color, background: conf.bg }}>
                                                    {conf.text}
                                                </span>
                                            </div>

                                            <div className="aim-match-reason">{match.match_reason}</div>

                                            {match.matching_features && match.matching_features.length > 0 && (
                                                <div className="aim-match-features">
                                                    {match.matching_features.slice(0, 4).map((f, i) => (
                                                        <span key={i} className="aim-match-feature">✓ {f}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="aim-sim-bar-wrap">
                                                <div className="aim-sim-bar-bg">
                                                    <div
                                                        className="aim-sim-bar-fill"
                                                        style={{
                                                            width: `${match.similarity_score}%`,
                                                            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}CC)`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="aim-sim-pct" style={{ color: scoreColor }}>
                                                    {match.similarity_score}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AIMatchModal;
