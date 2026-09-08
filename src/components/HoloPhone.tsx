import React, { useRef } from 'react';
import { ScreenId, HoloColorTheme, GestureType } from '../types';
import { HomeScreen } from './screens/HomeScreen';
import { PhoneScreen } from './screens/PhoneScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { CameraScreen } from './screens/CameraScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { MusicScreen } from './screens/MusicScreen';
import { CalculatorScreen } from './screens/CalculatorScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ArrowLeft, Home, Wifi, BatteryCharging, Shield, Sparkles } from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface HoloPhoneProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onBack: () => void;
  colorTheme: HoloColorTheme;
  cursorPos: { x: number; y: number }; // normalized 0..1
  isPinching: boolean;
  webcamStream: MediaStream | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  pipEnabled: boolean;
  onTogglePip: () => void;
  sensitivity: number;
  onChangeSensitivity: (val: number) => void;
  currentGesture: GestureType;
}

export const HoloPhone: React.FC<HoloPhoneProps> = ({
  currentScreen,
  onNavigate,
  onBack,
  colorTheme,
  cursorPos,
  isPinching,
  webcamStream,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  pipEnabled,
  onTogglePip,
  sensitivity,
  onChangeSensitivity,
  currentGesture,
}) => {
  const phoneRef = useRef<HTMLDivElement>(null);

  // Dynamic 3D tilt calculation based on cursor position relative to screen center
  const tiltX = (cursorPos.y - 0.5) * -12; // tilt around X axis
  const tiltY = (cursorPos.x - 0.5) * 16;  // tilt around Y axis

  const getGlowStyles = () => {
    switch (colorTheme) {
      case 'violet':
        return {
          border: 'border-purple-500/60',
          shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.25)]',
          accent: 'text-purple-400',
          bgGlow: 'bg-purple-500/10',
        };
      case 'amber':
        return {
          border: 'border-amber-500/60',
          shadow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
          accent: 'text-amber-400',
          bgGlow: 'bg-amber-500/10',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/60',
          shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
          accent: 'text-emerald-400',
          bgGlow: 'bg-emerald-500/10',
        };
      case 'cyan':
      default:
        return {
          border: 'border-cyan-400/70',
          shadow: 'shadow-[0_0_50px_rgba(0,240,255,0.3)]',
          accent: 'text-cyan-400',
          bgGlow: 'bg-cyan-500/10',
        };
    }
  };

  const glow = getGlowStyles();

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4 perspective-[1200px]">
      {/* Background Holographic Emitter Beams */}
      <div className="absolute -inset-10 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[450px] h-[750px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-radial from-cyan-400/5 via-transparent to-transparent" />
      </div>

      {/* Main Holographic Mobile Device Body */}
      <div
        ref={phoneRef}
        id="holo-smartphone-frame"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className={`relative w-[340px] sm:w-[380px] h-[670px] rounded-[40px] bg-slate-950/75 backdrop-blur-xl border-2 ${glow.border} ${glow.shadow} flex flex-col overflow-hidden select-none transition-shadow duration-300 z-10`}
      >
        {/* Hologram Scanlines & Glass Sheen */}
        <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-white/5 via-transparent to-black/30 opacity-70" />
        <div
          className="absolute inset-0 pointer-events-none z-30 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Top Bezel Notch / Speaker Emitter */}
        <div className="relative pt-2 pb-1 px-6 flex items-center justify-between text-[11px] font-mono border-b border-slate-800/80 z-20 bg-slate-950/80">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Wifi className="w-3 h-3" />
            <span className="font-bold tracking-wider">HOLONET 6G</span>
          </div>

          {/* Center Hologram Lens Pill */}
          <div className="w-16 h-3.5 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="font-bold">100%</span>
            <BatteryCharging className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="relative flex-1 overflow-hidden z-10">
          {currentScreen === 'home' && (
            <HomeScreen onOpenApp={onNavigate} colorTheme={colorTheme} />
          )}
          {currentScreen === 'phone' && <PhoneScreen />}
          {currentScreen === 'messages' && <MessagesScreen />}
          {currentScreen === 'camera' && <CameraScreen webcamStream={webcamStream} />}
          {currentScreen === 'gallery' && <GalleryScreen />}
          {currentScreen === 'music' && <MusicScreen />}
          {currentScreen === 'calculator' && <CalculatorScreen />}
          {currentScreen === 'contacts' && (
            <ContactsScreen
              onCallContact={() => onNavigate('phone')}
              onMessageContact={() => onNavigate('messages')}
            />
          )}
          {currentScreen === 'calendar' && <CalendarScreen />}
          {currentScreen === 'settings' && (
            <SettingsScreen
              colorTheme={colorTheme}
              onSelectColorTheme={onChangeSensitivity ? () => {} : () => {}}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              voiceEnabled={voiceEnabled}
              onToggleVoice={onToggleVoice}
              pipEnabled={pipEnabled}
              onTogglePip={onTogglePip}
              sensitivity={sensitivity}
              onChangeSensitivity={onChangeSensitivity}
            />
          )}
        </div>

        {/* Persistent Bottom Holographic Navigation Bar */}
        <div className="relative h-14 px-6 border-t border-slate-800/80 flex items-center justify-between z-20 bg-slate-950/85">
          {/* Back Button (Controlled by Fist, Voice "Go Back", or Touch) */}
          <button
            id="holo-nav-back-btn"
            onClick={() => {
              soundFx.playBack();
              onBack();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-cyan-400/80 text-xs font-mono text-cyan-300 hover:text-white cursor-pointer transition-all active:scale-90 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>

          {/* Gesture feedback glyph */}
          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>HoloX Touchless</span>
          </div>

          {/* Home Button (Controlled by Palm Hold, Voice "Go Home", or Touch) */}
          <button
            id="holo-nav-home-btn"
            onClick={() => {
              soundFx.playPinchSelect();
              onNavigate('home');
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-cyan-400/80 text-xs font-mono text-cyan-300 hover:text-white cursor-pointer transition-all active:scale-90 shadow-sm"
          >
            <span>HOME</span>
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Virtual Holographic Cursor Overlay */}
        <div
          id="virtual-holo-cursor"
          style={{
            left: `${cursorPos.x * 100}%`,
            top: `${cursorPos.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute pointer-events-none z-50 transition-all duration-75"
        >
          {/* Outer Reticle */}
          <div
            className={`relative rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
              isPinching
                ? 'w-7 h-7 border-rose-400 shadow-[0_0_20px_#f43f5e] bg-rose-500/20'
                : 'w-8 h-8 border-cyan-400 shadow-[0_0_15px_#00f0ff] bg-cyan-500/10'
            }`}
          >
            {/* Center dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isPinching ? 'bg-rose-300' : 'bg-white'
              }`}
            />

            {/* Crosshair marks */}
            <div className="absolute -left-2 w-1.5 h-0.5 bg-cyan-400" />
            <div className="absolute -right-2 w-1.5 h-0.5 bg-cyan-400" />
            <div className="absolute -top-2 w-0.5 h-1.5 bg-cyan-400" />
            <div className="absolute -bottom-2 w-0.5 h-1.5 bg-cyan-400" />
          </div>

          {/* Pinch click ripple animation */}
          {isPinching && (
            <div className="absolute inset-0 -m-3 w-14 h-14 rounded-full border-2 border-rose-400 animate-ping pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};
