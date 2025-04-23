import React, { useState, useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import axios from 'axios';

const ChatbotWidget = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Initial greeting when component mounts
    addResponseMessage('Welcome to the University Assistant! How can I help you today?');
    setIsConnected(true);
  }, []);

  const handleNewUserMessage = async (newMessage) => {
    try {
      // Send message to Rasa server
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: newMessage
      });
      
      // Display Rasa's response
      if (response.data && response.data.length > 0) {
        response.data.forEach(msg => {
          addResponseMessage(msg.text);
        });
      } else {
        addResponseMessage("I'm sorry, I couldn't process your request.");
      }
    } catch (error) {
      console.error('Error communicating with the chatbot:', error);
      addResponseMessage('Sorry, there was an error connecting to the chatbot service.');
    }
  };

  return (
    <div className="chatbot-container">
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="University Assistant"
        subtitle={isConnected ? "Connected" : "Connecting..."}
      />
    </div>
  );
};

export default ChatbotWidget;