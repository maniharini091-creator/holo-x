import React, { useState, useEffect } from 'react';
import { APPS } from '../../data/mockData';
import { ScreenId, HoloColorTheme } from '../../types';
import {
  Phone,
  MessageSquare,
  Camera,
  Image,
  Music,
  Calculator,
  Users,
  Calendar,
  Settings,
  Zap,
  Wifi,
  Cpu,
  Eye,
  Radio
} from 'lucide-react';
import { soundFx } from '../../services/soundFx';

interface HomeScreenProps {
  onOpenApp: (appId: ScreenId) => void;
  colorTheme: HoloColorTheme;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Phone,
  MessageSquare,
  Camera,
  Image,
  Music,
  Calculator,
  Users,
  Calendar,
  Settings,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp, colorTheme }) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'violet':
        return 'text-purple-400';
      case 'amber':
        return 'text-amber-400';
      case 'emerald':
        return 'text-emerald-400';
      case 'cyan':
      default:
        return 'text-cyan-400';
    }
  };

  const getThemeBorderClass = () => {
    switch (colorTheme) {
      case 'violet':
        return 'border-purple-500/40 shadow-purple-500/20';
      case 'amber':
        return 'border-amber-500/40 shadow-amber-500/20';
      case 'emerald':
        return 'border-emerald-500/40 shadow-emerald-500/20';
      case 'cyan':
      default:
        return 'border-cyan-500/40 shadow-cyan-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-4 select-none overflow-y-auto custom-scrollbar">
      {/* Hologram Floating Clock Widget */}
      <div
        id="holo-home-clock"
        className={`relative mt-2 mb-4 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${getThemeBorderClass()} shadow-lg flex flex-col items-center justify-center text-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Hologram status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] uppercase font-mono tracking-widest text-slate-300 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>QUANTUM OS 4.2</span>
        </div>

        <div className={`text-4xl font-extrabold tracking-wider font-orbitron ${getThemeTextClass()} drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]`}>
          {timeStr || '12:00'}
        </div>
        <div className="text-xs font-mono text-slate-400 tracking-wider mt-1">
          {dateStr.toUpperCase()}
        </div>

        {/* Quick system indicators */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center justify-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>6G HOLONET</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>NPU: 128 TFLOPS</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Eye className="w-3 h-3 text-amber-400" />
            <span>LiDAR 120Hz</span>
          </div>
        </div>
      </div>

      {/* App Grid: 3x3 Circular Holographic Icons */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[11px] font-mono tracking-widest text-slate-400/80 uppercase px-1 mb-2.5 flex items-center justify-between">
          <span>APPLICATIONS</span>
          <span className="text-[10px] text-cyan-400/80">PINCH OR VOICE TO OPEN</span>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {APPS.map((app) => {
            const IconComponent = ICON_MAP[app.iconName] || Zap;
            return (
              <button
                key={app.id}
                id={`app-btn-${app.id}`}
                data-app-id={app.id}
                onClick={() => {
                  soundFx.playPinchSelect();
                  onOpenApp(app.id);
                }}
                onMouseEnter={() => soundFx.playKeyBeep(900)}
                className="group relative flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-cyan-500/60 transition-all duration-200 cursor-pointer active:scale-95"
              >
                {/* Glow ring */}
                <div className="relative w-13 h-13 rounded-full flex items-center justify-center bg-slate-800/80 border border-slate-700/80 group-hover:border-cyan-400 group-hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all duration-300">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${app.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                  <IconComponent className="w-6 h-6 text-slate-200 group-hover:text-cyan-300 transition-colors z-10" />

                  {app.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                      {app.badge}
                    </span>
                  )}
                </div>

                <span className="mt-1.5 text-[11px] font-medium tracking-wide text-slate-300 group-hover:text-white transition-colors">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hologram Voice Prompt Suggestion */}
      <div className="mt-3 py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-center">
        <p className="text-[10px] text-slate-400 font-mono">
          Try saying: <span className="text-cyan-300 font-semibold">"Open Camera"</span> or <span className="text-cyan-300 font-semibold">"Open Calculator"</span>
        </p>
      </div>
    </div>
  );
};
