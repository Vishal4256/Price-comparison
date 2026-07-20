import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am the PriceSmart shopping assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // Mock assistant response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I am processing your request using our specialized AI agents...' 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-medium flex items-center gap-2">
              <MessageSquare size={18} />
              Shopping Assistant
            </h3>
            <button onClick={toggleOpen} className="text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-br-none' 
                    : 'bg-gray-800 text-gray-100 self-start rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..." 
              className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={toggleOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default FloatingAssistant;
