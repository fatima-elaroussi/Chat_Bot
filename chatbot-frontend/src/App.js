import React from 'react';
import './App.css';
import ChatInterface  from './components/ChatInterface';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>University Information System</h1>
        <p>Ask any questions about courses, admissions, or campus facilities</p>
      </header>
      <main>
        <ChatInterface />
      </main>
    </div>
  );
}

export default App; 