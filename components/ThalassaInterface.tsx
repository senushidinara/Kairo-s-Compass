import React, { useState, useEffect, useRef } from 'react';
import { generateThalassaResponse } from '../services/geminiService';
import { AppMode } from '../types';

interface ThalassaInterfaceProps {
  mode: AppMode;
}

const ThalassaInterface: React.FC<ThalassaInterfaceProps> = ({ mode }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: mode === AppMode.HIDDEN ? "Neural link established. Listening to the Earth dream." : "Thalassa active. Monitoring optimization vectors. How can I assist with your fleet today?" }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isHidden = mode === AppMode.HIDDEN;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a calming female voice or system default
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    
    utterance.voice = preferredVoice;
    utterance.pitch = isHidden ? 0.8 : 1.0; // Lower pitch for hidden mode
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsProcessing(true);

    const response = await generateThalassaResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsProcessing(false);
    
    // Auto-speak the response
    speakText(response);
  };

  return (
    <div className={`glass-panel h-full flex flex-col rounded-xl overflow-hidden transition-all duration-700 border-t-4 ${isHidden ? 'border-t-purple-500' : 'border-t-sky-500'}`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${isHidden ? 'bg-purple-900/20' : 'bg-sky-900/20'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isHidden ? 'bg-purple-500 shadow-[0_0_10px_#d946ef]' : 'bg-sky-400 shadow-[0_0_10px_#38bdf8]'}`}></div>
          <h2 className="font-mono font-bold tracking-wider text-sm">
            {isHidden ? 'THALASSA // MENINGEAL LAYER' : 'THALASSA // AI NAVIGATOR'}
          </h2>
        </div>
        
        {/* Audio Visualizer Mockup */}
        <div className="flex gap-1 h-4 items-center">
            {[1,2,3,4,5].map(i => (
                <div 
                    key={i} 
                    className={`w-1 bg-current transition-all duration-100 ${isHidden ? 'text-purple-400' : 'text-sky-400'}`}
                    style={{ 
                        height: isSpeaking ? `${Math.random() * 100}%` : '20%',
                        animation: isSpeaking ? `pulse 0.2s infinite alternate` : 'none',
                        animationDelay: `${i * 0.1}s`
                    }}
                ></div>
            ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-slate-200' 
                : isHidden ? 'bg-purple-900/40 text-purple-100 border border-purple-500/30' : 'bg-sky-900/40 text-sky-100 border border-sky-500/30'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="text-xs text-slate-500 animate-pulse">
               {isHidden ? "Deciphering intention waves..." : "Calculating optimal trajectory..."}
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isHidden ? "Query the planetary mind..." : "Ask for route optimization..."}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-sky-500 font-mono"
          />
          <button 
            onClick={handleSend}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md font-bold text-xs tracking-wider uppercase transition-colors ${
                isHidden 
                ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            Transmit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThalassaInterface;
