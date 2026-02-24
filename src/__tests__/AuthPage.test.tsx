import { describe, it, expect, vi } from 'vitest';

import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import AuthPage from '../pages/AuthPage';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
    },
  },
}));

describe('AuthPage', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    // Wrap in act to avoid React warning
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });
});
