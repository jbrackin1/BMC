import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function UserList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
    phone: '',
    role_id: '',
    gender: '' // NEW
  });

  useEffect(() => {
    if (!user || !['admin', 'superadmin'].includes(user.role.toLowerCase())) {
      alert('Access denied: Admins or SuperAdmins only');
      navigate('/dashboard');
      return;
    }
    refetchUsers().finally(() => setLoading(false));
  }, [user, navigate]);

  const refetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', { credentials: 'include' });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to load users');
    }
  };

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      display_name: '',
      phone: '',
      role_id: '',
      gender: ''
    });
  };

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('✅ User created');
        resetForm();
        await refetchUsers();
      } else {
        const error = await res.json();
        alert(`❌ Failed: ${error?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const res = await fetch('/api/auth/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, newPassword: resetPassword })
      });
      if (res.ok) {
        alert('✅ Password reset');
        setResetTarget(null);
        setResetPassword('');
        await refetchUsers();
      } else {
        const error = await res.json();
        alert(`❌ Failed: ${error?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await refetchUsers();
    } catch (err) {
      console.error(err);
      alert('❌ Server error');
    }
  };

  const handleReactivate = async (userId) => {
    try {
      const res = await fetch('/api/auth/users/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        alert('✅ User reactivated');
        await refetchUsers();
      } else {
        const error = await res.json();
        alert(`❌ Failed: ${error?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error');
    }
  };

  return (
    <div className="user-list-page">
      <h2>All Users</h2>

      <form
        autoComplete="off"
        onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}
        style={{ display: 'grid', gap: '0.5rem', maxWidth: '500px', marginBottom: '2rem' }}
      >
        <h3>Create New User</h3>
        {['username', 'email', 'display_name', 'phone', 'role_id'].map((field) => (
          <input
            autoComplete="new-username"
            key={field}
            name={field}
            placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={form[field]}
            onChange={handleInput}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />
        ))}

        {/* GENDER DROPDOWN */}
        <select
          name="gender"
          value={form.gender}
          onChange={handleInput}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <div style={{ position: 'relative' }}>
          <input
            autoComplete="new-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={handleInput}
            style={{ width: '100%', paddingRight: '2.5rem', padding: '0.5rem', fontSize: '1rem' }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem' }}
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button
          type="submit"
          style={{ padding: '0.5rem', fontSize: '1rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          ➕ Create User
        </button>
      </form>

      {loading ? <p>Loading users...</p> : (
        <ul>
          {users.map((u) => {
            if (u.id === user.id) return null;

            return (
              <li key={u.id} style={{ marginBottom: '1rem' }}>
                <strong>{u.display_name}</strong> ({u.email}) – {u.role_name}<br />
                <small>Status: {u.is_deleted ? '❌ Deleted' : u.is_active ? '✅ Active' : '⚠️ Inactive'}</small><br />

                {u.is_active && !u.is_deleted && (
                  <>
                    {console.log(user)}
                    {user.role.toLowerCase() === 'superadmin' ? (
                      <button
                        style={{ color: 'red' }}
                        onClick={async () => {
                          const confirmed = window.confirm('🚨 Hard delete this user? This action is permanent.');
                          if (confirmed) {
                            try {
                              const res = await fetch(`/api/auth/admin/user/hard-delete/${u.id}`, {
                                method: 'DELETE',
                                credentials: 'include'
                              });
                              if (res.ok) {
                                alert('✅ User permanently deleted');
                                await refetchUsers();
                              } else {
                                const err = await res.json();
                                alert(`❌ Failed: ${err?.error || 'Unknown error'}`);
                              }
                            } catch (err) {
                              console.error(err);
                              alert('❌ Server error');
                            }
                          }
                        }}
                      >
                        🚨 Hard Delete
                      </button>
                    ) : (
                      <button onClick={() => handleDelete(u.id)}>🗑 Soft Delete</button>
                    )}
                  </>
                )}

                <button onClick={() => setResetTarget(u.id)}>🔑 Reset Password</button>
                {u.is_deleted && (
                  <button onClick={() => handleReactivate(u.id)}>♻️ Reactivate</button>
                )}
                <Link to={`/admin/users/${u.id}`} style={{ marginLeft: '0.5rem' }}>📄 View Details</Link>

                {resetTarget === u.id && (
                  <div>
                    <input
                      type="password"
                      placeholder="New password"
                      autoComplete="new-password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <button onClick={() => handleResetPassword(u.id)}>✅ Confirm</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}