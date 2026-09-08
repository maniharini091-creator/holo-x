import React from 'react';
import { FeedbackEvent, GestureType } from '../types';
import { Hand, Mic, Sparkles, Activity } from 'lucide-react';

interface GestureBannerHudProps {
  lastEvent: FeedbackEvent | null;
  detectedGesture: GestureType;
  gestureAction: string;
  lastVoiceCommand: string | null;
  lastVoiceAction: string | null;
}

export const GestureBannerHud: React.FC<GestureBannerHudProps> = ({
  detectedGesture,
  gestureAction,
  lastVoiceCommand,
  lastVoiceAction,
}) => {
  return (
    <div
      id="gesture-banner-hud"
      className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-stretch gap-3 z-30 select-none"
    >
      {/* Gesture Feedback Card */}
      <div className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Detected Gesture: <span className="text-cyan-300 font-bold">{detectedGesture}</span>
            </div>
            <div className="text-xs font-bold font-orbitron text-white">
              Action: <span className="text-emerald-400">{gestureAction || 'TRACKING'}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-[9px] font-mono text-slate-500">
          <span className="text-cyan-400">VISION 120FPS</span>
          <span>LiDAR DEPTH</span>
        </div>
      </div>

      {/* Voice Command Feedback Card */}
      <div className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase truncate max-w-[180px]">
              Voice Command: <span className="text-purple-300 font-bold">{lastVoiceCommand || 'Awaiting...'}</span>
            </div>
            <div className="text-xs font-bold font-orbitron text-white truncate max-w-[180px]">
              Action: <span className="text-cyan-400">{lastVoiceAction || 'Listening'}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-[9px] font-mono text-slate-500">
          <span className="text-purple-400">WHISPER AI</span>
          <span>VOICE SYNC</span>
        </div>
      </div>
    </div>
  );
};
