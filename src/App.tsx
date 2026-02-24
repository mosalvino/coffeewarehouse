import AdminPage from './pages/AdminPage';
import UserOrderPage from './pages/UserOrderPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css'

function TopRightNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Hide nav on auth or root page
  if (location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, padding: '1rem', zIndex: 50 }} className="flex gap-2">
      <button onClick={() => navigate('/order')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Go to Order Page</button>
      <button onClick={() => navigate('/admin')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Admin Page</button>
      {user && (
        <button onClick={async () => {
          await supabase.auth.signOut();
          navigate('/auth');
        }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Logout</button>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopRightNav />
      <div className="min-h-screen bg-gray-100 p-6">
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
}

export default App
