
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setUser] = useState<any>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);


  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError('');


      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        if (!profileError && profile) {
          if (profile.role === 'admin') navigate('/admin');
          else navigate('/order');
        } else {
          setError('Could not fetch user role.');
        }
      }
      setLoading(false);
    },
    [email, password, navigate]
  );

  const handleSignupRedirect = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      {/* Header */}
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Login to Coffee Warehouse</h2>

      {/* Login Form */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} autoComplete="off" noValidate>
        {error && <div style={{ color: '#d32f2f', marginBottom: 8, textAlign: 'center' }}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          style={{ background: '#1976d2', color: '#fff', padding: '8px 16px', borderRadius: 4, width: '100%', opacity: loading ? 0.6 : 1, border: 'none' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          style={{ background: '#388e3c', color: '#fff', padding: '8px 16px', borderRadius: 4, width: '100%', marginTop: 8, border: 'none' }}
          onClick={handleSignupRedirect}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
