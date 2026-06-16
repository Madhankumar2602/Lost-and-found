import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const ItemDetailsModal = ({ item, onClose, onAIMatch }) => {
    const [showContact, setShowContact] = useState(false);
    const [contactInfo, setContactInfo] = useState(null);
    const [loadingContact, setLoadingContact] = useState(false);

    if (!item) return null;

    // Function to mask phone number for privacy
    const maskPhoneNumber = (phone) => {
        if (!phone || phone === 'N/A') return 'N/A';
        
        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // If phone is too short, return masked version
        if (cleanPhone.length <= 4) return '****';
        
        // Show first 2 and last 2 digits, mask the rest
        const firstTwo = cleanPhone.substring(0, 2);
        const lastTwo = cleanPhone.substring(cleanPhone.length - 2);
        const maskedMiddle = '*'.repeat(cleanPhone.length - 4);
        
        return `${firstTwo}${maskedMiddle}${lastTwo}`;
    };

    // Function to create Gmail link
    const createGmailLink = (email) => {
        if (!email || email === 'N/A') return '#';
        const subject = encodeURIComponent(`Regarding your lost & found item: ${item.title || 'Item'}`);
        const body = encodeURIComponent(`Hi,\n\nI'm writing to you regarding your lost & found item: ${item.title || 'Item'}\n\nLocation: ${item.location || item.location_zone || 'Not specified'}\nDate: ${formattedDate}\n\n[Add your message here]\n\nBest regards`);
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    };

    // Function to handle email click
    const handleEmailClick = (email) => {
        if (!email || email === 'N/A') return;
        
        const gmailLink = createGmailLink(email);
        
        // Open Gmail compose in new tab
        window.open(gmailLink, '_blank');
    };

    const formattedDate = item.date
        ? new Date(item.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : item.date;

    const handleContactClick = async () => {
        if (showContact) {
            setShowContact(false);
            return;
        }

        if (contactInfo) {
            setShowContact(true);
            return;
        }

        setLoadingContact(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, phone')
                .eq('id', item.user_id)
                .single();

            if (!error && data) {
                setContactInfo(data);
            } else {
                setContactInfo({ full_name: 'N/A', email: 'N/A', phone: 'N/A' });
            }
        } catch {
            setContactInfo({ full_name: 'N/A', email: 'N/A', phone: 'N/A' });
        }
        setLoadingContact(false);
        setShowContact(true);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Scoped styles for contact panel */}
                <style>{`
                    .contact-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: .5rem;
                        flex: 1;
                        padding: .85rem 1.5rem;
                        border-radius: var(--r-full);
                        font-weight: 700;
                        font-size: .95rem;
                        background: linear-gradient(135deg, #3B82F6, #2563EB);
                        color: white;
                        border: none;
                        cursor: pointer;
                        transition: all var(--t-base);
                        box-shadow: 0 4px 14px rgba(37,99,235,.35);
                        font-family: inherit;
                    }
                    .contact-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 22px rgba(37,99,235,.45);
                    }
                    .contact-btn:disabled {
                        opacity: .6;
                        cursor: not-allowed;
                    }
                    .contact-btn.active {
                        background: linear-gradient(135deg, #1E40AF, #1E3A8A);
                    }
                    .contact-panel {
                        margin-top: 1rem;
                        background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
                        border: 1.5px solid #BFDBFE;
                        border-radius: var(--r-xl);
                        padding: 1.25rem 1.5rem;
                        animation: contactSlideIn 0.3s ease;
                    }
                    @keyframes contactSlideIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .contact-panel-title {
                        font-size: .75rem;
                        font-weight: 700;
                        letter-spacing: .08em;
                        text-transform: uppercase;
                        color: #3B82F6;
                        margin-bottom: .85rem;
                        display: flex;
                        align-items: center;
                        gap: .4rem;
                    }
                    .contact-row {
                        display: flex;
                        align-items: center;
                        gap: .75rem;
                        padding: .6rem 0;
                        border-bottom: 1px solid rgba(59,130,246,.12);
                    }
                    .contact-row:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }
                    .contact-row-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1rem;
                        flex-shrink: 0;
                        box-shadow: 0 2px 8px rgba(59,130,246,.12);
                    }
                    .contact-row-info {
                        display: flex;
                        flex-direction: column;
                        min-width: 0;
                    }
                    .contact-row-label {
                        font-size: .72rem;
                        font-weight: 600;
                        color: #64748B;
                        text-transform: uppercase;
                        letter-spacing: .05em;
                    }
                    .contact-row-value {
                        font-size: .95rem;
                        font-weight: 600;
                        color: #1E293B;
                        word-break: break-all;
                    }
                    .contact-row-value a {
                        color: #2563EB;
                        text-decoration: none;
                        transition: color var(--t-fast);
                    }
                    .contact-row-value a:hover {
                        color: #1D4ED8;
                        text-decoration: underline;
                    }
                    .contact-loading {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: .5rem;
                        padding: 1rem;
                        color: #3B82F6;
                        font-size: .9rem;
                        font-weight: 500;
                    }
                    .contact-spinner {
                        width: 18px;
                        height: 18px;
                        border: 2.5px solid #BFDBFE;
                        border-top-color: #3B82F6;
                        border-radius: 50%;
                        animation: spin 0.6s linear infinite;
                    }
                `}</style>

                {/* Hero Image */}
                {item.image ? (
                    <img src={item.image} alt={item.title} className="modal-image" />
                ) : (
                    <div style={{
                        height: '220px',
                        background: 'linear-gradient(135deg, #1E293B, #334155)',
                        borderRadius: '40px 40px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem'
                    }}>
                        {item.type === 'lost' ? '🔍' : '📦'}
                    </div>
                )}

                <div className="modal-body">
                    {/* Top row */}
                    <div className="modal-top">
                        <span className={`badge ${item.type}`}>
                            {item.type === 'lost' ? '● Lost' : '● Found'}
                        </span>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>

                    <h2 className="modal-title">{item.title}</h2>

                    <p className="modal-meta">
                        📍 {item.location || item.location_zone || 'Unknown location'}
                        &nbsp;·&nbsp;
                        🗓 {formattedDate}
                    </p>

                    {/* Description */}
                    {item.description && (
                        <div className="modal-detail-block">
                            <div className="modal-detail-label">Description</div>
                            <p className="modal-detail-text">{item.description}</p>
                        </div>
                    )}

                    {/* Category */}
                    {item.category && (
                        <div className="modal-detail-block">
                            <div className="modal-detail-label">Category</div>
                            <p className="modal-detail-text">{item.category}</p>
                        </div>
                    )}

                    {/* Contact Info Panel */}
                    {showContact && contactInfo && (
                        <div className="contact-panel">
                            <div className="contact-panel-title">
                                📋 Reporter Details
                            </div>
                            <div className="contact-row">
                                <div className="contact-row-icon">👤</div>
                                <div className="contact-row-info">
                                    <span className="contact-row-label">Name</span>
                                    <span className="contact-row-value">{contactInfo.full_name || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="contact-row">
                                <div className="contact-row-icon">📧</div>
                                <div className="contact-row-info">
                                    <span className="contact-row-label">Email</span>
                                    <span className="contact-row-value">
                                        {contactInfo.email && contactInfo.email !== 'N/A' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>{contactInfo.email}</span>
                                                <button 
                                                    onClick={() => handleEmailClick(contactInfo.email)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: '#3B82F6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                                                >
                                                    ✉️ Send Email
                                                </button>
                                            </div>
                                        ) : (
                                            'N/A'
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="contact-row">
                                <div className="contact-row-icon">📞</div>
                                <div className="contact-row-info">
                                    <span className="contact-row-label">Phone</span>
                                    <span className="contact-row-value" style={{ color: '#64748B', fontStyle: 'italic' }}>
                                        {maskPhoneNumber(contactInfo.phone)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingContact && (
                        <div className="contact-loading">
                            <div className="contact-spinner" />
                            Fetching contact info…
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions" style={{ marginTop: '1.25rem', flexWrap: 'wrap' }}>
                        <button
                            className={`contact-btn ${showContact ? 'active' : ''}`}
                            onClick={handleContactClick}
                            disabled={loadingContact}
                            id="contact-reporter-btn"
                        >
                            {showContact ? '✕ Hide Contact' : '📞 Contact Reporter'}
                        </button>
                        {item.image && onAIMatch && (
                            <button
                                className="contact-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                    boxShadow: '0 4px 14px rgba(99,102,241,.35)',
                                }}
                                onClick={() => {
                                    onClose();
                                    onAIMatch(item);
                                }}
                                id="ai-match-btn"
                            >
                                🤖 Find Similar Items
                            </button>
                        )}
                        <button className="btn btn-ghost" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ItemDetailsModal;