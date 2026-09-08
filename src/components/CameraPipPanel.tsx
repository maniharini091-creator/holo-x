import React, { useRef, useEffect } from 'react';
import { HandTrackingState, VoiceState, GestureType } from '../types';
import { Camera, Video, VideoOff, RefreshCw, Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface CameraPipPanelProps {
  webcamStream: MediaStream | null;
  handState: HandTrackingState;
  voiceState: VoiceState;
  isWebcamActive: boolean;
  onToggleWebcam: () => void;
  onSimulateGesture: (gesture: GestureType) => void;
}

// MediaPipe Hand connections graph
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm knuckles
  [5, 9], [9, 13], [13, 17],
];

export const CameraPipPanel: React.FC<CameraPipPanelProps> = ({
  webcamStream,
  handState,
  voiceState,
  isWebcamActive,
  onToggleWebcam,
  onSimulateGesture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Bind video stream
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Render skeletal hand landmarks on overlay canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!handState.handDetected || handState.landmarks.length < 21) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const lms = handState.landmarks;

    // 1. Draw connecting skeletal bones
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = lms[startIdx];
      const p2 = lms[endIdx];
      if (!p1 || !p2) continue;

      ctx.beginPath();
      // Mirror X coordinates to match selfie video
      ctx.moveTo((1 - p1.x) * w, p1.y * h);
      ctx.lineTo((1 - p2.x) * w, p2.y * h);
      ctx.stroke();
    }

    // 2. Draw landmark joints
    for (let i = 0; i < lms.length; i++) {
      const lm = lms[i];
      const x = (1 - lm.x) * w;
      const y = lm.y * h;

      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(x, y, isTip ? 4.5 : 2.5, 0, Math.PI * 2);

      if (i === 8) {
        // Index tip (virtual cursor pointer)
        ctx.fillStyle = handState.isPinching ? '#f43f5e' : '#fbbf24';
        ctx.shadowColor = handState.isPinching ? '#f43f5e' : '#fbbf24';
      } else if (i === 4) {
        // Thumb tip
        ctx.fillStyle = handState.isPinching ? '#f43f5e' : '#34d399';
        ctx.shadowColor = handState.isPinching ? '#f43f5e' : '#34d399';
      } else {
        ctx.fillStyle = isTip ? '#ffffff' : '#00f0ff';
        ctx.shadowColor = '#00f0ff';
      }
      ctx.shadowBlur = 6;
      ctx.fill();
    }
  }, [handState]);

  return (
    <div
      id="camera-pip-panel"
      className="w-full max-w-[320px] rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/40 p-4 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col justify-between select-none"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold font-orbitron text-white tracking-wider">
            HAND TRACKING PIP
          </h3>
        </div>
        <button
          onClick={onToggleWebcam}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-[10px] font-mono text-cyan-300 cursor-pointer transition-colors"
        >
          {isWebcamActive ? (
            <>
              <Video className="w-3 h-3 text-emerald-400" />
              <span>ACTIVE</span>
            </>
          ) : (
            <>
              <VideoOff className="w-3 h-3 text-rose-400" />
              <span>OFFLINE</span>
            </>
          )}
        </button>
      </div>

      {/* Video Stream & Landmark Canvas Container */}
      <div className="relative aspect-[4/3] rounded-2xl bg-black border border-slate-800 overflow-hidden my-3 flex items-center justify-center">
        {isWebcamActive && webcamStream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100 opacity-70"
            />
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-mono text-slate-400">Webcam Inactive</p>
            <button
              onClick={onToggleWebcam}
              className="mt-2 px-3 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold cursor-pointer transition-transform active:scale-95"
            >
              Start Laptop Webcam
            </button>
          </div>
        )}

        {/* HUD Scanner Reticle */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[9px] font-mono text-cyan-300">
          FPS: {handState.fps || 60}
        </div>

        {/* Gesture Badge inside Preview */}
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">GESTURE:</span>
          <span className="font-bold text-cyan-300 tracking-wider">
            {handState.currentGesture}
          </span>
        </div>
      </div>

      {/* Required System Status Indicators */}
      <div className="space-y-1.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Hand Tracking:</span>
          <span
            className={`font-bold ${
              handState.isActive && handState.handDetected
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            {handState.isActive && handState.handDetected ? 'ACTIVE' : 'READY / SEARCHING'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Voice Recognition:</span>
          <span
            className={`font-bold ${
              voiceState.isListening ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            {voiceState.isListening ? 'READY (LISTENING)' : 'READY'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">System Status:</span>
          <span className="font-bold text-emerald-400">ONLINE</span>
        </div>
      </div>

      {/* Quick Gesture Simulation Dock (for testing without webcam) */}
      <div className="mt-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono text-slate-400">
          <span>GESTURE SIMULATOR</span>
          <span className="text-[8px] text-cyan-400">CLICK TO TRIGGER</span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
          <button
            onClick={() => onSimulateGesture('PINCH')}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white"
          >
            Pinch
          </button>
          <button
            onClick={() => onSimulateGesture('SWIPE_LEFT')}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white"
          >
            Swipe L
          </button>
          <button
            onClick={() => onSimulateGesture('SWIPE_RIGHT')}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white"
          >
            Swipe R
          </button>
          <button
            onClick={() => onSimulateGesture('FIST')}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white"
          >
            Fist
          </button>
        </div>
      </div>
    </div>
  );
};
