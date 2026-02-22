// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { CoffeeOrderForm } from './components/CoffeeOrderForm';
import AdminPage from './pages/AdminPage';
import UserOrderPage from './pages/UserOrderPage';
import AuthPage from './pages/AuthPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Coffee Warehouse Dashboard</h1>
          <p className="text-gray-600 mt-1">Create and manage coffee orders efficiently</p>
        </header>
        <main>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/order" element={<UserOrderPage />} />
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
