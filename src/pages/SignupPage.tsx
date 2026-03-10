
import React, { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [standName, setStandName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          stand_name: standName,
        },
      },
    });
    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('invalid email')) {
        setError('Please enter a valid email address.');
      } else if (signUpError.message.toLowerCase().includes('rate limit')) {
        setError('Too many signup attempts. Please wait and try again later.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name,
          email,
          stand_name: standName,
          role: 'user',
        }
      ]);
      if (profileError) {
        setError('Profile creation failed: ' + profileError.message);
        setLoading(false);
        return;
      }
    }
    setSuccess('Signup successful! Please check your email to confirm your account.');
    setLoading(false);
  }, [name, email, standName, password]);

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Sign Up for Coffee Warehouse</h2>
      {error && <div style={{ color: '#d32f2f', marginBottom: 8, textAlign: 'center' }}>{error}</div>}
      {success && <div style={{ color: '#388e3c', marginBottom: 8, textAlign: 'center' }}>{success}</div>}
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: '100%' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: '100%' }}
          required
        />
        <input
          type="text"
          placeholder="Coffee Stand Name"
          value={standName}
          onChange={e => setStandName(e.target.value)}
          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: '100%' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: '100%' }}
          required
        />
        <button
          type="submit"
          style={{ background: '#388e3c', color: '#fff', padding: '8px 16px', borderRadius: 4, width: '100%', opacity: loading ? 0.6 : 1, border: 'none' }}
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
