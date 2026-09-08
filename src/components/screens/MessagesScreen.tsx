import React, { useState } from 'react';
import { MOCK_MESSAGES } from '../../data/mockData';
import { MessageItem } from '../../types';
import { Send, Mic, Sparkles, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const MessagesScreen: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>(MOCK_MESSAGES);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    soundFx.playPinchSelect();
    const newMsg: MessageItem = {
      id: `m_${Date.now()}`,
      sender: 'Operator',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulated holographic AI reply
    setTimeout(() => {
      soundFx.playVoiceCommandChime();
      const reply: MessageItem = {
        id: `reply_${Date.now()}`,
        sender: 'Nexus AI',
        text: `Transmitted via HoloX mesh network. Packet latency: 4ms.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  const handleQuickMsg = (txt: string) => {
    setInputVal(txt);
  };

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-orbitron text-cyan-400">Quantum Comms</h2>
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>QUANTUM E2E ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 custom-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.isAi ? 'items-start' : 'items-end'}`}
          >
            <span className="text-[9px] font-mono text-slate-500 mb-0.5 px-1">
              {m.sender} • {m.time}
            </span>
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                m.isAi
                  ? 'bg-slate-900/90 border border-cyan-500/40 text-cyan-100 rounded-tl-sm shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm shadow-md'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {['Ready to sync', 'Voice command verified', 'LiDAR calibrated'].map((p) => (
          <button
            key={p}
            onClick={() => handleQuickMsg(p)}
            className="text-[9px] font-mono whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 hover:border-cyan-400 text-slate-300 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type holographic message..."
          className="flex-1 h-10 px-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none font-mono"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
