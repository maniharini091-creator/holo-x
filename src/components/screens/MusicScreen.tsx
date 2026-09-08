import React, { useState, useEffect } from 'react';
import { MOCK_TRACKS } from '../../data/mockData';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc, Activity } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const MusicScreen: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [bars, setBars] = useState<number[]>([40, 65, 85, 30, 95, 70, 50, 80, 60, 45, 90, 35]);

  const currentTrack = MOCK_TRACKS[currentIdx];

  // Animated visualizer spectrum bars
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBars(Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 20));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    soundFx.playPinchSelect();
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    soundFx.playSwipe();
    setCurrentIdx((prev) => (prev + 1) % MOCK_TRACKS.length);
  };

  const handlePrev = () => {
    soundFx.playSwipe();
    setCurrentIdx((prev) => (prev - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length);
  };

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between items-center text-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="text-left">
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">HoloX Sonic</h2>
          <p className="text-[9px] font-mono text-slate-400">NEURAL AUDIO MATRIX</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>LOSSLESS DSD</span>
        </div>
      </div>

      {/* Hologram Disc / Orb Visualizer */}
      <div className="relative my-auto flex items-center justify-center">
        {/* Glowing concentric rings */}
        <div
          className={`w-44 h-44 rounded-full border-2 border-cyan-400/60 flex items-center justify-center ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '8s' }}
        >
          <div className="w-36 h-36 rounded-full border border-purple-500/50 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-cyan-300/80 bg-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <Disc className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Center glowing dot */}
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff] pointer-events-none" />
      </div>

      {/* Track Info */}
      <div className="w-full">
        <h3 className="text-base font-bold font-orbitron text-white tracking-wider">
          {currentTrack.title}
        </h3>
        <p className="text-xs font-mono text-cyan-300 mt-0.5">{currentTrack.artist}</p>

        {/* Equalizer spectrum bars */}
        <div className="flex items-end justify-center gap-1.5 h-12 my-3 px-6">
          {bars.map((height, i) => (
            <div
              key={i}
              className="w-2 rounded-t-full bg-gradient-to-t from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-100 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
              style={{ height: `${isPlaying ? height : 15}%` }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 px-2">
          <span>01:14</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="w-1/3 h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
          </div>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          id="music-prev-btn"
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-all active:scale-90"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          id="music-play-btn"
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] cursor-pointer transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
        </button>

        <button
          id="music-next-btn"
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-all active:scale-90"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
