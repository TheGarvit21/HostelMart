import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to HostelMart</h1>
        <p className="mt-4 text-gray-600">Your one-stop shop for hostel essentials</p>
      </main>
    </div>
  );
}

export default App;
