import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Bot, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api';

export default function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I am the PriceWise AI Assistant. What are you looking to buy today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await api.post('/api/assistant/chat', { 
                message: userMsg 
            });

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: response.data.text,
                products: response.data.products 
            }]);
        } catch (error) {
            let errorMsg = 'Oops, my connection to the PriceWise engine got interrupted. Try asking again!';
            if (error.response?.status === 401) {
                errorMsg = 'Your session has expired. Please log in again to use the assistant.';
            } else if (error.response?.status === 429) {
                errorMsg = 'I am receiving too many requests right now. Please wait a moment and try again.';
            }
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: errorMsg 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white w-[350px] md:w-[400px] h-[600px] max-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4"
                    >
                        {/* Header */}
                        <div className="bg-[#0B1E36] text-white p-4 flex items-center justify-between shadow-md relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-500/20 p-2 rounded-xl">
                                    <Bot className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="font-black leading-tight">Gemini Assistant</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-indigo-200 uppercase tracking-widest font-bold">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        Live Price Engine
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    
                                    {/* Text Bubble */}
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#0B1E36] text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                                        {msg.role === 'assistant' && (
                                            <Sparkles className="w-3 h-3 text-indigo-500 mb-1 inline-block mr-1" />
                                        )}
                                        {msg.text}
                                    </div>

                                    {/* Product Cards (If AI returned them) */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="flex overflow-x-auto gap-3 mt-3 w-full hide-scrollbar pb-2">
                                            {msg.products.map(p => (
                                                <div key={p.id} className="w-[200px] flex-shrink-0 bg-white border border-indigo-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-2 mix-blend-multiply">
                                                        <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{p.retailer}</div>
                                                    <div className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 h-8">{p.title}</div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="font-black text-[#0B1E36]">₹{p.price.toLocaleString()}</div>
                                                        <a href={p.url} target="_blank" rel="noreferrer" className="w-6 h-6 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex items-start">
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                        <span className="text-xs font-bold text-slate-500">Querying retailers...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 relative z-10">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for a recommendation..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 bg-[#0B1E36] hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-indigo-600 text-white'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
