import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      return setStatus('Passwords do not match.');
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStatus(data.error || 'Reset failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('Server error');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Reset Your Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />

      <button
        onClick={handleSubmit}
        style={{ padding: '0.5rem 1rem', background: '#333', color: 'white' }}
      >
        Reset Password
      </button>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}