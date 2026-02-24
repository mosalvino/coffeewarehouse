import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [standName, setStandName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Sign up user with Supabase
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
      // Friendly error messages for common cases
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
    // Insert profile row
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
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up for Coffee Warehouse</h2>
      {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
      {success && <div className="text-green-500 mb-2 text-center">{success}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Coffee Stand Name"
          value={standName}
          onChange={e => setStandName(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
