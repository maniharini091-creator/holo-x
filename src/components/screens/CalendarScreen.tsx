import React from 'react';
import { Calendar, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const CalendarScreen: React.FC = () => {
  const events = [
    { time: '09:00 AM', title: 'HoloX System Calibration', cat: 'System', active: true },
    { time: '11:30 AM', title: 'MediaPipe Gesture Tuning', cat: 'Vision', active: false },
    { time: '02:00 PM', title: 'Voice Engine Synchronization', cat: 'Audio', active: false },
    { time: '05:00 PM', title: 'Holographic Phone Live Demo', cat: 'Deploy', active: false },
  ];

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">Quantum Chrono</h2>
          <p className="text-[9px] font-mono text-slate-400">TEMPORAL LOGIC MATRIX</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
          <Calendar className="w-3.5 h-3.5" />
          <span>OCT 2026</span>
        </div>
      </div>

      {/* Mini Calendar Week strip */}
      <div className="grid grid-cols-7 gap-1 py-2 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[9px] font-mono text-slate-400">
            {d}
          </div>
        ))}
        {[19, 20, 21, 22, 23, 24, 25].map((num, i) => {
          const isToday = num === 22;
          return (
            <div
              key={num}
              onClick={() => soundFx.playKeyBeep(600 + i * 40)}
              className={`py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                isToday
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>

      {/* Agenda events */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {events.map((ev, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border transition-all ${
              ev.active
                ? 'bg-slate-900/90 border-cyan-400/80 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {ev.time}
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                {ev.cat}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white font-orbitron mt-1">{ev.title}</h4>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center text-[9px] font-mono text-slate-500">
        Syncing with Quantum Chrono cloud servers
      </div>
    </div>
  );
};
