import { useState } from "react";
import supabase from "../services/supabase";
import OTPModal from "./OTPModal";

const campusZones = [
    "Tech Park", "University Building (UB)", "Main Library",
    "Java Green / Canteen", "Bio-Tech Block", "Electrical Block",
    "Architecture Block", "Hostels (Abode/Estancia)",
    "Hostels (Kaari/Paari/Oori)", "Main Gate"
];

const categories = [
    "Electronics", "ID Card / Wallet", "Bag / Backpack",
    "Keys", "Clothing / Accessories", "Books / Notes", "Other"
];

const ItemForm = ({ type }) => {
    const isLost = type === 'lost';
    const accent = isLost ? '#EF4444' : '#10B981';
    const accentDim = isLost ? '#FEF2F2' : '#ECFDF5';

    const [formData, setFormData] = useState({
        title: "", category: "", description: "",
        locationZone: "", specificLocation: "", date: "",
        name: "", registrationNumber: "", email: "", phone: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            setFormData(d => ({ ...d, [name]: files[0] }));
            setImagePreview(URL.createObjectURL(files[0]));
        } else {
            setFormData(d => ({ ...d, [name]: value }));
        }
    };

    const removeImage = () => {
        setFormData(d => ({ ...d, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: formData.email,
            options: { shouldCreateUser: true }
        });
        if (error) { alert(error.message); setLoading(false); return; }
        setLoading(false);
        setShowOTP(true);
    };

    const nextStep = () => setCurrentStep(p => Math.min(p + 1, 3));
    const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

    // ─── Shared input style ───────────────────────────────────
    const inp = {
        width: '100%',
        padding: '.8rem 1.1rem',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        fontSize: '.95rem',
        fontFamily: 'inherit',
        background: 'var(--n50)',
        color: 'var(--text)',
        outline: 'none',
        transition: 'all var(--t-fast)',
    };

    return (
        <>
            {/* ─── Scoped micro styles ─── */}
            <style>{`
                .if-card { background: var(--surface); border-radius: var(--r-2xl); box-shadow: var(--shadow-lg); border: 1px solid var(--border); overflow: hidden; max-width: 820px; margin: 0 auto; }
                .if-header { padding: 2rem 2.5rem; background: ${accentDim}; border-bottom: 1px solid var(--border); }
                .if-header h2 { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--n800); letter-spacing: -.03em; margin-bottom: .3rem; }
                .if-header p  { font-size: .9rem; color: var(--n500); }
                .if-steps { display: flex; align-items: center; padding: 1.4rem 2.5rem; background: var(--n50); border-bottom: 1px solid var(--border); gap: 0; }
                .if-step { display: flex; align-items: center; gap: .6rem; font-size: .875rem; font-weight: 500; color: var(--n400); flex: 1; }
                .if-step.active { color: ${accent}; font-weight: 600; }
                .if-step.done   { color: ${accent}; }
                .if-step-num { width: 30px; height: 30px; border-radius: 50%; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; background: white; flex-shrink: 0; }
                .if-step.active .if-step-num { background: ${accent}; border-color: ${accent}; color: white; }
                .if-step.done   .if-step-num { background: ${accent}; border-color: ${accent}; color: white; }
                .if-connector { flex: 1; height: 1px; background: var(--n200); margin: 0 .5rem; }
                .if-body { padding: 2.5rem; }
                .if-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                @media (max-width: 600px) { .if-grid { grid-template-columns: 1fr; } }
                .if-full { grid-column: 1 / -1; }
                .if-field { display: flex; flex-direction: column; gap: .4rem; }
                .if-label { font-size: .85rem; font-weight: 600; color: var(--n700); display: flex; align-items: center; gap: .3rem; }
                .if-req { color: ${accent}; }
                .if-input:focus, .if-select:focus, .if-textarea:focus { border-color: ${accent}; box-shadow: 0 0 0 3px ${accentDim}; background: white; }
                .if-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.5rem; }
                .if-textarea { min-height: 100px; resize: vertical; }
                .if-hint { font-size: .78rem; color: var(--n400); }
                .if-upload { border: 2px dashed var(--n300); border-radius: var(--r-xl); padding: 2rem; text-align: center; cursor: pointer; position: relative; transition: all var(--t-fast); background: var(--n50); }
                .if-upload:hover { border-color: ${accent}; background: ${accentDim}; }
                .if-upload.has-img { border: none; padding: 0; background: none; }
                .if-preview { position: relative; border-radius: var(--r-xl); overflow: hidden; }
                .if-preview img { width: 100%; max-height: 220px; object-fit: cover; display: block; }
                .if-remove-img { position: absolute; top: .7rem; right: .7rem; background: rgba(0,0,0,.55); backdrop-filter: blur(4px); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: background var(--t-fast); }
                .if-remove-img:hover { background: rgba(0,0,0,.8); }
                .if-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; font-size: 0; }
                .if-actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
                .if-btn-main { padding: .8rem 2rem; border-radius: var(--r-full); font-weight: 700; font-size: .95rem; background: linear-gradient(135deg, ${isLost ? '#EF4444,#DC2626' : '#10B981,#059669'}); color: white; border: none; cursor: pointer; transition: all var(--t-base); box-shadow: 0 4px 14px ${isLost ? 'rgba(220,38,38,.3)' : 'rgba(5,150,105,.3)'}; font-family: inherit; }
                .if-btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px ${isLost ? 'rgba(220,38,38,.4)' : 'rgba(5,150,105,.4)'}; }
                .if-btn-main:disabled { opacity: .5; cursor: not-allowed; }
                .if-btn-back { padding: .8rem 1.75rem; border-radius: var(--r-full); font-weight: 600; font-size: .95rem; background: var(--n100); color: var(--n700); border: 1.5px solid var(--n200); cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
                .if-btn-back:hover { background: var(--n200); }
                .if-verify-panel { text-align: center; padding: 3rem 1rem; }
                .if-verify-icon { font-size: 4rem; margin-bottom: 1rem; }
                .if-verify-title { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--n800); margin-bottom: .5rem; }
                .if-verify-sub { color: var(--n500); margin-bottom: 2rem; font-size: .95rem; line-height: 1.6; }
                .if-verify-email { font-weight: 600; color: ${accent}; }
            `}</style>

            <div className="if-card">
                {/* Header */}
                <div className="if-header">
                    <h2>{isLost ? '🔍 Report Lost Item' : '📦 Report Found Item'}</h2>
                    <p>Fill in the details — accuracy helps us reunite items faster.</p>
                </div>

                {/* Steps */}
                <div className="if-steps">
                    {[
                        { n: 1, label: 'Item Details' },
                        { n: 2, label: 'Your Info' },
                        { n: 3, label: 'Verify' }
                    ].map((s, i) => (
                        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <div className={`if-step ${currentStep === s.n ? 'active' : currentStep > s.n ? 'done' : ''}`}>
                                <div className="if-step-num">
                                    {currentStep > s.n ? '✓' : s.n}
                                </div>
                                <span>{s.label}</span>
                            </div>
                            {i < 2 && <div className="if-connector" />}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="if-body">
                    <form onSubmit={handleSubmit}>

                        {/* Step 1 – Item Details */}
                        {currentStep === 1 && (
                            <div className="if-grid">
                                <div className="if-field if-full">
                                    <label className="if-label">📝 What was {type}? <span className="if-req">*</span></label>
                                    <input style={inp} className="if-input" name="title" placeholder="e.g. Blue Dell Laptop, Black Wallet" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="if-field">
                                    <label className="if-label">🏷️ Category <span className="if-req">*</span></label>
                                    <select style={inp} className="if-select" name="category" value={formData.category} onChange={handleChange} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="if-field">
                                    <label className="if-label">📅 Date &amp; Time <span className="if-req">*</span></label>
                                    <input type="datetime-local" style={inp} className="if-input" name="date" value={formData.date} onChange={handleChange} required />
                                </div>
                                <div className="if-field">
                                    <label className="if-label">📍 Campus Zone <span className="if-req">*</span></label>
                                    <select style={inp} className="if-select" name="locationZone" value={formData.locationZone} onChange={handleChange} required>
                                        <option value="">Select Zone</option>
                                        {campusZones.map(z => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <div className="if-field">
                                    <label className="if-label">📌 Specific Spot <span className="if-req">*</span></label>
                                    <input style={inp} className="if-input" name="specificLocation" placeholder="e.g. Room 404, 3rd Floor Bench" value={formData.specificLocation} onChange={handleChange} required />
                                </div>
                                <div className="if-field if-full">
                                    <label className="if-label">📄 Description <span className="if-req">*</span></label>
                                    <textarea style={inp} className="if-textarea" name="description" placeholder="Describe scratches, stickers, or unique features…" value={formData.description} onChange={handleChange} required />
                                </div>
                                <div className="if-field if-full">
                                    <label className="if-label">📸 Upload Image <span className="if-hint">(optional)</span></label>
                                    <div className={`if-upload ${imagePreview ? 'has-img' : ''}`}>
                                        {!imagePreview ? (
                                            <>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📷</div>
                                                <div style={{ fontWeight: 600, color: 'var(--n600)', marginBottom: '.25rem' }}>Click or drag to upload</div>
                                                <div className="if-hint">JPG, PNG up to 10 MB</div>
                                            </>
                                        ) : (
                                            <div className="if-preview">
                                                <img src={imagePreview} alt="Preview" />
                                                <button type="button" className="if-remove-img" onClick={removeImage}>✕</button>
                                            </div>
                                        )}
                                        <input type="file" name="image" className="if-file-input" onChange={handleChange} accept="image/*" />
                                    </div>
                                </div>
                                <div className="if-actions if-full">
                                    <button type="button" className="if-btn-main" onClick={nextStep}>Continue →</button>
                                </div>
                            </div>
                        )}

                        {/* Step 2 – Personal Info */}
                        {currentStep === 2 && (
                            <div className="if-grid">
                                <div className="if-field">
                                    <label className="if-label">👤 Full Name <span className="if-req">*</span></label>
                                    <input style={inp} className="if-input" name="name" placeholder="As per ID card" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="if-field">
                                    <label className="if-label">🆔 Registration No. <span className="if-req">*</span></label>
                                    <input style={inp} className="if-input" name="registrationNumber" placeholder="e.g. RA21..." value={formData.registrationNumber} onChange={handleChange} required />
                                    <span className="if-hint">Format: RA21... or similar</span>
                                </div>
                                <div className="if-field">
                                    <label className="if-label">📧 SRM Email <span className="if-req">*</span></label>
                                    <input type="email" style={inp} className="if-input" name="email" placeholder="xx1234@srmist.edu.in" value={formData.email} onChange={handleChange} required />
                                    <span className="if-hint">We'll send a verification code</span>
                                </div>
                                <div className="if-field">
                                    <label className="if-label">📞 Phone Number <span className="if-req">*</span></label>
                                    <input type="tel" style={inp} className="if-input" name="phone" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} required />
                                </div>
                                <div className="if-actions if-full">
                                    <button type="button" className="if-btn-back" onClick={prevStep}>← Back</button>
                                    <button type="button" className="if-btn-main" onClick={nextStep}>Continue →</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 – Verify */}
                        {currentStep === 3 && (
                            <div className="if-verify-panel">
                                <div className="if-verify-icon">🔐</div>
                                <h3 className="if-verify-title">Verify your identity</h3>
                                <p className="if-verify-sub">
                                    We'll send a 6-digit OTP to<br />
                                    <span className="if-verify-email">{formData.email}</span>
                                </p>
                                <div className="if-actions" style={{ justifyContent: 'center' }}>
                                    <button type="button" className="if-btn-back" onClick={prevStep}>← Back</button>
                                    <button type="submit" className="if-btn-main" disabled={loading}>
                                        {loading ? 'Sending…' : 'Send OTP Code →'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {showOTP && (
                <OTPModal
                    email={formData.email}
                    formData={formData}
                    type={type}
                    onClose={() => setShowOTP(false)}
                />
            )}
        </>
    );
};

export default ItemForm;