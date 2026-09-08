import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, Delete, UserCheck, Mic, Volume2 } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const PhoneScreen: React.FC = () => {
  const [number, setNumber] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const handleDigit = (digit: string) => {
    soundFx.playKeyBeep(600 + parseInt(digit || '5', 10) * 40);
    if (number.length < 15) {
      setNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    soundFx.playKeyBeep(450);
    setNumber((prev) => prev.slice(0, -1));
  };

  const handleStartCall = () => {
    soundFx.playPinchSelect();
    setInCall(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    soundFx.playBack();
    setInCall(false);
    setCallDuration(0);
  };

  const KEYPAD = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between">
      {/* Phone Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-base font-bold font-orbitron text-cyan-400">Quantum Phone</h2>
          <p className="text-[10px] font-mono text-slate-400">ENCRYPTED QUANTUM LINK</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>HD VOICE</span>
        </div>
      </div>

      {inCall ? (
        /* Active Hologram Call UI */
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="relative w-28 h-28 rounded-full border-2 border-cyan-400/80 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.3)] animate-pulse">
            <div className="absolute inset-1 rounded-full bg-cyan-500/10" />
            <UserCheck className="w-14 h-14 text-cyan-300" />
          </div>

          <h3 className="mt-4 text-xl font-bold font-orbitron text-white">
            {number || '+1 (800) HOLO-AI'}
          </h3>
          <p className="text-xs font-mono text-emerald-400 mt-1">CONNECTED • 00:{callDuration < 10 ? `0${callDuration}` : callDuration}</p>

          <div className="flex items-center gap-4 mt-8">
            <button className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <Mic className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Keypad */
        <>
          {/* Number Display */}
          <div className="my-3 py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between min-h-[52px]">
            <span className="text-xl font-mono text-cyan-300 tracking-wider">
              {number || <span className="text-slate-600">Enter hologram dial...</span>}
            </span>
            {number && (
              <button
                onClick={handleBackspace}
                className="text-slate-400 hover:text-rose-400 p-1 rounded-lg"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-auto">
            {KEYPAD.map(({ num, sub }) => (
              <button
                key={num}
                id={`dial-${num}`}
                onClick={() => handleDigit(num)}
                className="h-13 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="text-lg font-bold font-orbitron text-white leading-tight">{num}</span>
                {sub && <span className="text-[8px] font-mono text-slate-400 tracking-widest">{sub}</span>}
              </button>
            ))}
          </div>

          {/* Call Trigger Button */}
          <div className="flex justify-center mt-2">
            <button
              id="start-call-btn"
              onClick={handleStartCall}
              className="w-full max-w-[200px] h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-orbitron font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>HOLO CALL</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
