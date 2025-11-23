import React, { useState } from 'react';
import.meta.env.VITE_API_URL || 'http://localhost:3000'

function AuthScreen({ onLogin }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Only for new users
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3000/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3000/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, username }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user, data.token);
            } else {
                if (data.isNewUser) {
                    setIsNewUser(true);
                    setError("New user? Please enter a username to complete registration.");
                } else {
                    setError(data.error);
                }
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card join-container">
            <h1 className="join-title">Login</h1>

            {step === 1 ? (
                <form onSubmit={handleRequestOtp}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>OTP sent to {email}</p>
                    <p style={{ color: '#eab308', fontSize: '0.8rem', marginBottom: '1.5rem', background: 'rgba(234, 179, 8, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                        ⚠️ Dev Mode: Check server terminal for OTP
                    </p>

                    <div className="input-group">
                        <label className="input-label">Enter OTP</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    {isNewUser && (
                        <div className="input-group">
                            <label className="input-label">Choose Username</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setIsNewUser(false); setError(''); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                            Change Email
                        </button>
                        <ResendButton email={email} setError={setError} />
                    </div>
                </form>
            )}
        </div>
    );
}

function ResendButton({ email, setError }) {
    const [timer, setTimer] = useState(30); // 30s cooldown
    const [canResend, setCanResend] = useState(false);

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        setCanResend(false);
        setTimer(60); // Reset to 60s after first resend
        setError('');

        try {
            const res = await fetch('http://localhost:3000/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                setCanResend(true); // Allow retry if failed immediately (e.g. rate limit)
                setTimer(0);
            }
        } catch (err) {
            setError('Failed to resend OTP');
            setCanResend(true);
        }
    };

    return (
        <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            style={{
                background: 'transparent',
                border: 'none',
                color: canResend ? '#3b82f6' : '#64748b',
                cursor: canResend ? 'pointer' : 'default'
            }}
        >
            {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
        </button>
    );
}

export default AuthScreen;
