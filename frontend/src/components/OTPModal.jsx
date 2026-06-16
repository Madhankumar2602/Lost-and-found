import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../services/supabase";

const OTPModal = ({ email, formData, type, onClose }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleGoHome = () => {
        onClose();
        navigate('/');
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            alert("Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);

        // 1. Verify OTP
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otpString,
            type: "email"
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        // 2. Get session/user
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session.user;

        // 3. Upsert profile
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                email: user.email,
                full_name: formData.name,
                registration_number: formData.registrationNumber,
                phone: formData.phone,
                role: "student"
            });

        if (profileError) {
            alert(profileError.message);
            setLoading(false);
            return;
        }

        // 4. Upload image (if provided)
        let imageUrl = null;
        if (formData.image) {
            const fileExt = formData.image.name.split('.').pop();
            const fileName = `public/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('item-images')
                .upload(fileName, formData.image, {
                    contentType: formData.image.type,
                    upsert: false
                });

            if (uploadError) {
                alert("Image upload failed: " + uploadError.message);
                setLoading(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('item-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData?.publicUrl || null;
        }

        // 5. Insert item record
        const { error: insertError } = await supabase
            .from("items")
            .insert([{
                title: formData.title,
                category: formData.category,
                description: formData.description,
                type: type,
                date_time: formData.date,
                location_zone: formData.locationZone,
                specific_location: formData.specificLocation,
                user_id: user.id,
                image_url: imageUrl
            }]);

        if (insertError) {
            alert(insertError.message);
            setLoading(false);
            return;
        }

        setLoading(false);
        setVerified(true);
    };

    return (
        <div className="otp-modal-overlay" onClick={verified ? undefined : onClose}>
            <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
                {verified ? (
                    <div className="otp-success">
                        {/* Confetti dots */}
                        <div className="otp-confetti" aria-hidden="true">
                            {[...Array(18)].map((_, i) => (
                                <span key={i} className={`otp-confetti-dot otp-confetti-dot--${i % 6}`} />
                            ))}
                        </div>

                        {/* Animated checkmark */}
                        <div className="otp-success-icon">
                            <div className="otp-success-ring" />
                            <svg viewBox="0 0 52 52" className="otp-checkmark">
                                <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="otp-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>

                        {/* Badge */}
                        <div className="otp-success-badge">
                            <span className="otp-success-badge-dot" />
                            Report Submitted
                        </div>

                        <h2 className="otp-success-title">Successfully Verified!</h2>
                        <p className="otp-success-subtitle">
                            Your report has been received and is now live on the portal.
                            <br />
                            <span className="otp-success-highlight">Thank you for helping your community! 🎉</span>
                        </p>

                        {/* Mini stats row */}
                        <div className="otp-success-stats">
                            <div className="otp-success-stat">
                                <span className="otp-success-stat-icon">🔒</span>
                                <span>Identity Verified</span>
                            </div>
                            <div className="otp-success-stat-divider" />
                            <div className="otp-success-stat">
                                <span className="otp-success-stat-icon">📋</span>
                                <span>Report Filed</span>
                            </div>
                            <div className="otp-success-stat-divider" />
                            <div className="otp-success-stat">
                                <span className="otp-success-stat-icon">🌐</span>
                                <span>Now Live</span>
                            </div>
                        </div>

                        <button
                            className="otp-home-btn"
                            onClick={handleGoHome}
                            id="go-home-btn"
                        >
                            <span className="otp-home-btn-icon">🏠</span>
                            Go to Home Page
                            <span className="otp-home-btn-arrow">→</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="otp-icon">🔐</div>
                        <h2 className="otp-title">Verify your identity</h2>
                        <p className="otp-subtitle">
                            We sent a 6-digit code to<br />
                            <strong>{email}</strong>
                        </p>

                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    className="otp-input"
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            className="otp-verify-btn"
                            onClick={handleVerify}
                            disabled={loading}
                        >
                            {loading ? "Verifying…" : "Verify & Submit"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OTPModal;

