import React from 'react';
import SQLAgent from './components/SQLAgent';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SQL Database Explorer</h1>
          <p className="text-gray-600">Browse and analyze your database tables with ease</p>
        </div>
        <SQLAgent />
      </div>
    </div>
  );
}

export default App;