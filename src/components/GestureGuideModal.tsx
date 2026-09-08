import React from 'react';
import { X, Hand, Pointer, MoveLeft, MoveRight, CircleDot, Layers, Home, CheckCircle2 } from 'lucide-react';
import { GestureType } from '../types';

interface GestureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGesture: (gesture: GestureType) => void;
}

const GESTURES_LIST = [
  {
    id: 'OPEN_PALM' as GestureType,
    name: 'Open Palm',
    action: 'Move / Select Mode',
    desc: 'Spread all five fingers open. Activates cursor tracking and navigation hover state.',
    icon: Hand,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'POINT' as GestureType,
    name: 'Point (Index)',
    action: 'Move Cursor',
    desc: 'Extend index finger while curling thumb, middle, ring, and pinky. Precision virtual pointer.',
    icon: Pointer,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'PINCH' as GestureType,
    name: 'Pinch (Thumb + Index)',
    action: 'Click / Select',
    desc: 'Bring thumb tip and index finger tip together. Triggers instant tactile holographic selection.',
    icon: CircleDot,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
  },
  {
    id: 'SWIPE_LEFT' as GestureType,
    name: 'Swipe Left',
    action: 'Next Page / Tab',
    desc: 'Move open hand rapidly from right to left across webcam frame. Cycles to the next screen.',
    icon: MoveLeft,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 'SWIPE_RIGHT' as GestureType,
    name: 'Swipe Right',
    action: 'Previous Page / Tab',
    desc: 'Move open hand rapidly from left to right across webcam frame. Cycles to previous screen.',
    icon: MoveRight,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 'FIST' as GestureType,
    name: 'Fist',
    action: 'Back Navigation',
    desc: 'Curl all fingers tightly into a fist. Navigates back in the application stack.',
    icon: Hand,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'TWO_FINGER' as GestureType,
    name: 'Two-Finger Gesture',
    action: 'Open Menu / Apps',
    desc: 'Extend index and middle fingers together (peace sign / V). Opens the central app drawer.',
    icon: Layers,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
  },
  {
    id: 'PALM_HOLD' as GestureType,
    name: 'Open Palm + Hold (>1.2s)',
    action: 'Home Screen',
    desc: 'Keep open palm stationary in front of camera for over 1.2 seconds. Returns to Home.',
    icon: Home,
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/80',
  },
];

export const GestureGuideModal: React.FC<GestureGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectGesture,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-orbitron text-white">
                HoloX Gesture Control Reference
              </h3>
              <p className="text-xs font-mono text-slate-400">
                8 Computer Vision Hand Gestures via MediaPipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gestures Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
          {GESTURES_LIST.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={g.id}
                onClick={() => {
                  onSelectGesture(g.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl bg-slate-950/60 border ${g.borderColor} hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                      → {g.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${g.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold font-orbitron text-white group-hover:text-cyan-300 transition-colors">
                      {g.name}
                    </h4>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-2 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Click to test gesture</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    Simulate →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gestures work simultaneously with Voice Commands in real time</span>
        </div>
      </div>
    </div>
  );
};
