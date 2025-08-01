// src/pages/ForgotPassword.jsx
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: data.message });
      } else {
        setStatus({ success: false, message: data.error });
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      setStatus({ success: false, message: 'Something went wrong.' });
    }
  };

  return (
    <div className="form-page">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {status && (
        <p className={status.success ? 'success' : 'error'}>{status.message}</p>
      )}
    </div>
  );
}

export default ForgotPassword;