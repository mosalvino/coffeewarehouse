import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        setRole(profile?.role || null);
      }
      setLoading(false);
    };
    checkAuth();
    // Listen for auth changes
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

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(role || '')) return <Navigate to="/auth" />;
    } else {
      if (role !== requiredRole) return <Navigate to="/auth" />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
