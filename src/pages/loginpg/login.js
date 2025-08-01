import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1 = login form, 2 = MFA form
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        setStep(2); // Go to MFA step
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const handleVerifyMfa = async () => {
    try {
      const res = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: mfaCode })
      });

      if (res.ok) {
        const me = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (me.ok) {
          const user = await me.json();
          setUser(user.user);
        }
        navigate('/admin/dashboard');
      } else {
        alert('Invalid or expired MFA code');
      }
    } catch (err) {
      console.error(err);
      alert('Verification failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          className="login-form"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '320px',
            width: '100%',
            padding: '1rem'
          }}
        >
          {step === 1 && (
            <>
              {/* Email Input */}
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />

              {/* Password Input with Eye Toggle */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingRight: '2.5rem',
                    padding: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.75rem',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    lineHeight: 1
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                <a href="/forgot-password" style={{ color: '#007bff' }}>
                  Forgot your password?
                </a>
              </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleLogin}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Submit
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p>MFA code sent to your email</p>
              <input
                placeholder="Enter MFA code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={handleVerifyMfa}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Verify
              </button>
            </>
          )}
        </div>
      </main>

      <footer
        style={{
          padding: '1rem',
          background: '#0a1a2c',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        © 2025 bettermindcare
      </footer>
    </div>
  );
}