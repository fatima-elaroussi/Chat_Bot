import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader } from 'lucide-react';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: 'Bonjour ! Comment puis-je vous aider concernant les informations universitaires ?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send to Rasa backend
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: input
      });
      
      // Process response from Rasa
      if (response.data && response.data.length > 0) {
        response.data.forEach(msg => {
          setMessages(prev => [...prev, { text: msg.text, sender: 'bot' }]);
        });
      } else {
        setMessages(prev => [...prev, {
          text: "Je ne suis pas sûr(e) de savoir comment répondre à cela. Pouvez-vous reformuler votre question ?",
          sender: 'bot'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: 'Désolé, une erreur s’est produite lors du traitement de votre demande.',
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="chat-header bg-indigo-700 text-white p-4 flex items-center space-x-2">
        <MessageCircle size={24} />
        <h2 className="text-xl font-semibold">Assistant universitaire</h2>
      </div>
      
      <div className="chat-messages bg-gray-50 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender} ${msg.sender === 'user' ? 'user-message' : 'bot-message'} mb-4`}
          >
            <div className="message-content">
              {msg.text}
            </div>
            <div className="message-time text-xs text-gray-500 mt-1">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot bot-message mb-4">
            <div className="message-content flex items-center space-x-2">
              <Loader size={16} className="animate-spin" />
              <span className="typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="chat-input-form p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tapez votre question ici..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="send-button bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;