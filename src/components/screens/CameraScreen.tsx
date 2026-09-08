import React, { useState } from 'react';
import { Camera, RefreshCw, Sparkles, Sliders, Scan, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

interface CameraScreenProps {
  webcamStream: MediaStream | null;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ webcamStream }) => {
  const [filterMode, setFilterMode] = useState<'holo' | 'wire' | 'thermal'>('holo');
  const [captured, setCaptured] = useState(false);
  const [depthScan, setDepthScan] = useState('1.24m');

  const handleCapture = () => {
    soundFx.playPinchSelect();
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1200);
  };

  const cycleFilter = () => {
    soundFx.playKeyBeep(750);
    setFilterMode((prev) => (prev === 'holo' ? 'wire' : prev === 'wire' ? 'thermal' : 'holo'));
  };

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between relative overflow-hidden">
      {/* Viewfinder Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-10">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">Spatial LiDAR Cam</h2>
          <p className="text-[9px] font-mono text-slate-400">DEPTH SENSOR • 4K 120FPS</p>
        </div>
        <button
          onClick={cycleFilter}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 font-mono cursor-pointer"
        >
          <Sliders className="w-3 h-3" />
          <span className="uppercase">{filterMode} MODE</span>
        </button>
      </div>

      {/* Viewfinder Frame */}
      <div className="relative flex-1 my-3 rounded-2xl bg-black border-2 border-cyan-500/60 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        {/* Flash Effect on Capture */}
        {captured && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-500 pointer-events-none" />
        )}

        {/* Live video feed or simulated sci-fi hologram visual */}
        {webcamStream ? (
          <video
            autoPlay
            playsInline
            muted
            ref={(videoEl) => {
              if (videoEl && videoEl.srcObject !== webcamStream) {
                videoEl.srcObject = webcamStream;
              }
            }}
            className={`w-full h-full object-cover -scale-x-100 ${
              filterMode === 'thermal'
                ? 'hue-rotate-180 contrast-150 saturate-200'
                : filterMode === 'wire'
                ? 'invert contrast-200'
                : 'brightness-110 contrast-105'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <Scan className="w-12 h-12 text-cyan-400/60 animate-pulse mb-3" />
            <p className="text-xs font-mono text-cyan-300">SPATIAL SCANNER ACTIVE</p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Holographic camera feed synchronized
            </p>
          </div>
        )}

        {/* Holographic AR Reticle & Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

          {/* Center targeting circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 rounded-full border border-cyan-400/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="absolute -top-3 text-[9px] font-mono text-cyan-300 tracking-wider">
                LOCK: 99.8%
              </div>
            </div>
          </div>

          {/* Real-time telemetry */}
          <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] font-mono text-cyan-400/90 drop-shadow-md">
            <span>DEPTH: {depthScan}</span>
            <span>EXPOSURE: +0.2</span>
            <span>AI TRACK: OK</span>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex items-center justify-around py-1 z-10">
        <button
          onClick={() => soundFx.playKeyBeep(500)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Shutter Button (triggers photo capture) */}
        <button
          id="camera-shutter-btn"
          onClick={handleCapture}
          className="w-16 h-16 rounded-full p-1 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] cursor-pointer hover:scale-105 active:scale-90 transition-transform"
        >
          <div className="w-full h-full rounded-full bg-white hover:bg-cyan-100 flex items-center justify-center">
            <Camera className="w-6 h-6 text-slate-900" />
          </div>
        </button>

        <button
          onClick={() => soundFx.playKeyBeep(850)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 hover:text-cyan-300"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {captured && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg z-50 animate-bounce">
          <CheckCircle2 className="w-3 h-3" />
          <span>SAVED TO HOLO-VAULT</span>
        </div>
      )}
    </div>
  );
};
