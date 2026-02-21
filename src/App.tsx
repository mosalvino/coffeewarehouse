// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { CoffeeOrderForm } from './components/CoffeeOrderForm';
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coffee Warehouse Dashboard</h1>
        <p className="text-gray-600 mt-1">Create and manage coffee orders efficiently</p>
      </header>

      <main>
        <CoffeeOrderForm />
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">&copy; 2026 Coffee Warehouse Inc.</footer>
    </div>
  );
}

export default App
