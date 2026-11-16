import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Sparkles, User, Bot, Paperclip } from 'lucide-react';

export interface ChatViewProps {
  onBack?: () => void;
  topic?: string;
  className?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  onBack,
  topic = 'Concept Socratic Discussion',
  className = '',
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I'm Nilo's Socratic AI assistant. What concept would you like to explore or clarify today? You can test your hypotheses with me or ask for step-by-step guidance.`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Great thought! Let's break that down using first principles: What is the primary causal mechanism behind it, and what happens if we alter the boundary condition?`,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#FAF8FE] text-[#1E1926] font-sans ${className}`}>
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-purple-100/80 bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-100/50 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wheel</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#1E1926]">Nilo Socratic Chat</span>
              <p className="text-[11px] text-slate-500">{topic}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto [scrollbar-width:none]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user' ? 'bg-[#1E1926] text-white' : 'bg-purple-100 text-[#7C5CFF]'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#7C5CFF] to-[#906BFF] text-white rounded-tr-none'
                  : 'bg-white border border-purple-100 text-slate-800 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-purple-100 bg-white/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your question or explanation..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs focus:outline-none focus:border-[#7C5CFF] shadow-xs"
          />
          <button
            onClick={handleSend}
            className="p-3 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#EC4899] text-white shadow-md shadow-purple-500/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
