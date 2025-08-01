/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/public-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      alert('Signup successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create Your Account</h2>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="gender" placeholder="Gender (optional)" onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;