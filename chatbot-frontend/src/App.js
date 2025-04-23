import React from 'react';
import { BookOpen } from 'lucide-react';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-indigo-900 text-white py-6 px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen size={28} />
            <h1 className="text-2xl font-bold">Système d'information universitaire</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li className="hover:text-indigo-200 transition-colors cursor-pointer">Admissions</li>
              <li className="hover:text-indigo-200 transition-colors cursor-pointer">Cours</li>
              <li className="hover:text-indigo-200 transition-colors cursor-pointer">Vie sur le campus</li>
              <li className="hover:text-indigo-200 transition-colors cursor-pointer">Contact</li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Assistant virtuel universitaire</h2>
          <p className="text-gray-600">Posez toutes vos questions concernant les cours, les admissions ou les installations du campus.</p>
        </div>
        
        <ChatInterface />
      </main>
      
      <footer className="bg-gray-100 border-t py-4 px-8 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto">
          <p>© {new Date().getFullYear()} Système d'information universitaire - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

export default App;