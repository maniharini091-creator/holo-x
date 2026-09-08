import React from 'react';
import { HoloColorTheme } from '../../types';
import { Palette, Hand, Mic, Volume2, Shield, Sliders, Check } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

interface SettingsScreenProps {
  colorTheme: HoloColorTheme;
  onSelectColorTheme: (theme: HoloColorTheme) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  pipEnabled: boolean;
  onTogglePip: () => void;
  sensitivity: number;
  onChangeSensitivity: (val: number) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  colorTheme,
  onSelectColorTheme,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  pipEnabled,
  onTogglePip,
  sensitivity,
  onChangeSensitivity,
}) => {
  const THEMES: { id: HoloColorTheme; name: string; colorHex: string }[] = [
    { id: 'cyan', name: 'Cyber Cyan', colorHex: '#00f0ff' },
    { id: 'violet', name: 'Neon Violet', colorHex: '#c084fc' },
    { id: 'amber', name: 'Solar Amber', colorHex: '#fbbf24' },
    { id: 'emerald', name: 'Matrix Green', colorHex: '#34d399' },
  ];

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">HoloX Optics</h2>
          <p className="text-[9px] font-mono text-slate-400">HARDWARE & SENSORS CONFIG</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>v2.4 ONLINE</span>
        </div>
      </div>

      <div className="space-y-4 my-2">
        {/* Hologram Color Theme */}
        <div>
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hologram Laser Theme</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  soundFx.playPinchSelect();
                  onSelectColorTheme(t.id);
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  colorTheme === t.id
                    ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: t.colorHex }}
                />
                <span className="flex-1 text-left">{t.name}</span>
                {colorTheme === t.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking Sensitivity Slider */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gesture Sensitivity</span>
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">{sensitivity}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={sensitivity}
            onChange={(e) => onChangeSensitivity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
            <span>SMOOTH</span>
            <span>BALANCED</span>
            <span>HYPER-FAST</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          {/* Audio Synthesizer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white font-orbitron">Haptic Audio FX</h4>
                <p className="text-[9px] font-mono text-slate-400">Chirp & frequency synth feedback</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playKeyBeep(800);
                onToggleSound();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Recognition */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white font-orbitron">Voice Recognition</h4>
                <p className="text-[9px] font-mono text-slate-400">Continuous background microphone</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playKeyBeep(800);
                onToggleVoice();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                voiceEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  voiceEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Camera PIP View */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white font-orbitron">Camera PIP Panel</h4>
                <p className="text-[9px] font-mono text-slate-400">Hand landmark tracking HUD</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playKeyBeep(800);
                onTogglePip();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                pipEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  pipEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 text-center text-[9px] font-mono text-slate-500">
        HoloX System Kernel 4.2 • Google DeepMind & AI Studio
      </div>
    </div>
  );
};
