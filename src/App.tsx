
import React, { useEffect, useState, useCallback } from 'react';
import AdminPage from './pages/AdminPage';
import AdminOnlyPage from './pages/AdminOnlyPage';
import UserOrderPage from './pages/UserOrderPage';
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
    const getUser = async () => {
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
    getUser();
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
  const handleGoAdminOnly = useCallback(() => navigate('/admin-only'), [navigate]);
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  }, [navigate]);

  if (location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div className="fixed top-0 right-0 p-4 z-50 flex items-center gap-3">
      {user?.email && (
        <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium mr-6">
          Logged in as: <span className="font-semibold">{user.email}</span>
        </span>
      )}
      <button onClick={handleGoOrder} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Go to Order Page</button>
      <button onClick={handleGoAdmin} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Admin Page</button>
      {role === 'admin' && (
        <button onClick={handleGoAdminOnly} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Tic Tac Toe (Admin)</button>
      )}
      {user && (
        <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Logout</button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TopRightNav />
        <div className="min-h-screen bg-gray-100 p-6" style={{ paddingTop: '50px' }}>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Coffee Warehouse Dashboard</h1>
          <p className="text-gray-600 mt-1">Create and manage coffee orders efficiently</p>
        </header>
        <main>
          <Routes>
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin-only" element={
              <ProtectedRoute requiredRole="admin">
                <AdminOnlyPage />
              </ProtectedRoute>
            } />
            <Route path="/order" element={
              <ProtectedRoute requiredRole={["user", "admin"]}>
                <UserOrderPage />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AuthPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        </main>
        <footer className="mt-8 text-center text-gray-500 text-sm">&copy; 2026 Coffee Warehouse Inc.</footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
