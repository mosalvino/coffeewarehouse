import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock supabase and react-router-dom
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { role: 'user' } }) })),
  },
}));
vi.mock('react-router-dom', () => ({ Navigate: () => <div>Redirected</div> }));

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', async () => {
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when user is not authenticated', async () => {
    // Override getUser to return null
    const supabase = (await import('../supabaseClient')).supabase;
    (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null } });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(await screen.findByText('Redirected')).toBeInTheDocument();
  });
});
