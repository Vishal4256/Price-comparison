import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AssistantPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to your Advanced Shopping Assistant. I can help you search, compare products, predict price trends, and set alerts. What are you looking for?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Our Agent Framework is currently evaluating your request. A specialized agent will respond shortly.' 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto p-4 md:p-6">
      <div className="bg-gray-800 rounded-t-xl p-6 border-b border-gray-700 flex items-center gap-3">
        <div className="bg-blue-900/50 p-3 rounded-lg text-blue-400">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">PriceSmart Assistant</h1>
          <p className="text-gray-400 text-sm">Powered by Multi-Agent AI</p>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-900 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {msg.role === 'user' ? <User size={20} className="text-white"/> : <Bot size={20} className="text-white"/>}
            </div>
            <div className={`p-4 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 text-white border border-blue-500/30 rounded-tr-none' 
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-b-xl p-4 border-t border-gray-700 flex gap-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me to compare laptops, set an alert for a phone, or predict prices..." 
          className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Send <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AssistantPage;
