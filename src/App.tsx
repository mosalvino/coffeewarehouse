
import React, { useEffect, useState, useCallback } from 'react';
import AdminPage from './pages/AdminPage';
import UserOrderPage from './pages/UserOrderPage';
import OrderReviewPage from './pages/OrderReviewPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

const TopRightNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }
    };
    getUserAndRole();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => setRole(profile?.role || null));
      } else {
        setRole(null);
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleGoOrder = useCallback(() => navigate('/order'), [navigate]);
  const handleGoAdmin = useCallback(() => navigate('/admin'), [navigate]);
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  }, [navigate]);

  if (location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div
      style={{
        background: '#222',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexWrap: 'wrap',
        minWidth: 0,
      }}
    >
      {user?.email && (
        <span style={{ fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Logged in as: <span style={{ fontWeight: 400 }}>{user.email}</span></span>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <button
          onClick={handleGoOrder}
          style={{ background: '#444', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 4 }}
        >
          Go to Order Page
        </button>
        {role === 'admin' && (
          <button
            onClick={handleGoAdmin}
            style={{ background: '#444', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          >
            Go to Admin Page
          </button>
        )}
        {user && (
          <button
            onClick={handleLogout}
            style={{ background: '#444', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TopRightNav />
        <div style={{ minHeight: '100vh', background: '#181818', padding: 24, paddingTop: 50 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>Coffee Warehouse Dashboard</h1>
          <p style={{ color: '#bbb', marginTop: 4 }}>Create and manage coffee orders efficiently</p>
        </header>
        <main>
          <Routes>
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/order" element={
              <ProtectedRoute requiredRole={["user", "admin"]}>
                <UserOrderPage />
              </ProtectedRoute>
            } />
            <Route path="/order/review" element={
              <ProtectedRoute requiredRole={["user", "admin"]}>
                <OrderReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AuthPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        </main>
        <footer style={{ marginTop: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>&copy; 2026 Coffee Warehouse Inc.</footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
