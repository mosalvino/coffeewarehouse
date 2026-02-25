
import React, { useEffect, useState, useCallback } from 'react';
import AdminPage from './pages/AdminPage';
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

  const handleGoOrder = useCallback(() => navigate('/order'), [navigate]);
  const handleGoAdmin = useCallback(() => navigate('/admin'), [navigate]);
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  }, [navigate]);

  if (location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div className="nav-bar">
      {user?.email && (
        <span className="nav-user">Logged in as: <span className="nav-user-email">{user.email}</span></span>
      )}
      <button onClick={handleGoOrder} className="nav-btn nav-btn-gray">Go to Order Page</button>
      <button onClick={handleGoAdmin} className="nav-btn nav-btn-gray">Go to Admin Page</button>
      {user && (
        <button onClick={handleLogout} className="nav-btn nav-btn-gray">Logout</button>
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
