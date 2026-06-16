import React from 'react';

const ItemCard = ({ item, onClick, onAIMatch }) => {
    const formattedDate = item.date
        ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return (
        <div className="item-card" onClick={onClick}>
            {/* Image */}
            <div className="card-image-wrap">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="card-image" />
                ) : (
                    <div className="card-image-placeholder">
                        <span>{item.type === 'lost' ? '🔍' : '📦'}</span>
                    </div>
                )}
                <div className="card-badge-wrap">
                    <span className={`badge ${item.type}`}>
                        {item.type === 'lost' ? '● Lost' : '● Found'}
                    </span>
                </div>

                {/* AI Match Button — only on items with images */}
                {item.image && onAIMatch && (
                    <button
                        className="card-ai-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAIMatch(item);
                        }}
                        title="Find AI Matches"
                    >
                        <span className="card-ai-btn-icon">🤖</span>
                        <span className="card-ai-btn-text">AI Match</span>
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="card-content">
                <h3 className="card-title">{item.title}</h3>

                <div className="card-meta">
                    <span>📍</span>
                    <span>{item.location || item.location_zone || '—'}</span>
                </div>

                {item.description && (
                    <p className="card-desc">{item.description}</p>
                )}

                <div className="card-footer">
                    <span className="card-date">{formattedDate || item.date}</span>
                    <div className="card-arrow">→</div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;