import React from 'react';
import { VoiceState } from '../types';
import { Mic, MicOff, Volume2, Sparkles, Command } from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface VoiceStatusHudProps {
  voiceState: VoiceState;
  onToggleVoice: () => void;
  onSimulateCommand: (command: string) => void;
}

const VOICE_COMMAND_EXAMPLES = [
  'Open Phone',
  'Open Messages',
  'Open Calculator',
  'Open Camera',
  'Open Gallery',
  'Open Music',
  'Show Contacts',
  'Open Settings',
  'Go Home',
  'Go Back',
];

export const VoiceStatusHud: React.FC<VoiceStatusHudProps> = ({
  voiceState,
  onToggleVoice,
  onSimulateCommand,
}) => {
  return (
    <div
      id="voice-control-panel"
      className="w-full max-w-[320px] rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-purple-500/40 p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col justify-between select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              voiceState.isListening ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <h3 className="text-xs font-bold font-orbitron text-white tracking-wider">
            VOICE COMMAND HUB
          </h3>
        </div>
        <button
          onClick={onToggleVoice}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 hover:border-purple-400 text-[10px] font-mono text-purple-300 cursor-pointer transition-colors"
        >
          {voiceState.isListening ? (
            <>
              <Mic className="w-3 h-3 text-purple-400 animate-pulse" />
              <span>LISTENING</span>
            </>
          ) : (
            <>
              <MicOff className="w-3 h-3 text-slate-400" />
              <span>MUTED</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Status Graphic */}
      <div className="my-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1 h-8 my-1">
          {[12, 24, 36, 20, 42, 28, 16, 32, 18, 26].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-purple-600 to-cyan-400 transition-all ${
                voiceState.isListening ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: voiceState.isListening ? `${h}px` : '6px',
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>

        <div className="text-xs font-mono text-purple-200 mt-1 truncate max-w-full">
          {voiceState.lastTranscript ? (
            <span>"{voiceState.lastTranscript}"</span>
          ) : (
            <span className="text-slate-500">Awaiting voice command input...</span>
          )}
        </div>

        <p className="text-[9px] font-mono text-slate-400 mt-0.5">
          Laptop Built-in Microphone: <span className="text-emerald-400">ONLINE</span>
        </p>
      </div>

      {/* Voice Command Quick Simulators */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3 text-purple-400" />
            <span>TEST VOICE TRIGGERS</span>
          </span>
          <span className="text-[8px] text-purple-400">CLICK TO SIMULATE</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          {VOICE_COMMAND_EXAMPLES.map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                soundFx.playVoiceCommandChime();
                onSimulateCommand(cmd);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-purple-400 hover:bg-purple-950/30 text-slate-300 hover:text-white text-left truncate transition-colors cursor-pointer active:scale-95"
            >
              • {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
