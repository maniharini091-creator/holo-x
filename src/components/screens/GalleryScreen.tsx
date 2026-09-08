import React, { useState } from 'react';
import { MOCK_GALLERY } from '../../data/mockData';
import { GalleryPhoto } from '../../types';
import { Image, X, ZoomIn, Share2, Layers } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const GalleryScreen: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const handleSelect = (photo: GalleryPhoto) => {
    soundFx.playPinchSelect();
    setSelectedPhoto(photo);
  };

  const handleClose = () => {
    soundFx.playBack();
    setSelectedPhoto(null);
  };

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">Holo Vault</h2>
          <p className="text-[9px] font-mono text-slate-400">4 SPATIAL HOLOGRAM MEMORIES</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
          <Layers className="w-3.5 h-3.5" />
          <span>3D PROJECTION</span>
        </div>
      </div>

      {/* Photos Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3 my-auto py-2">
        {MOCK_GALLERY.map((photo) => (
          <div
            key={photo.id}
            id={`gallery-item-${photo.id}`}
            onClick={() => handleSelect(photo)}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-400/80 cursor-pointer transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,240,255,0.3)] bg-slate-900"
          >
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2.5">
              <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest">
                {photo.category}
              </span>
              <span className="text-[11px] font-bold text-white truncate font-orbitron">
                {photo.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-400">{selectedPhoto.title}</span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 my-3 rounded-2xl overflow-hidden border border-cyan-500/50 relative flex items-center justify-center bg-black">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300 flex justify-between">
              <span>CAPTURED: {selectedPhoto.date}</span>
              <span className="text-cyan-300">SPATIAL 3D: 100%</span>
            </div>
          </div>

          <div className="flex justify-around pt-1">
            <button className="flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-cyan-300">
              <ZoomIn className="w-4 h-4" />
              <span>DEPTH VIEW</span>
            </button>
            <button className="flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-cyan-300">
              <Share2 className="w-4 h-4" />
              <span>BEAM HOLO</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation footer hint */}
      <div className="text-center">
        <p className="text-[10px] font-mono text-slate-500">
          Pinch photo to inspect • Swipe to cycle photos
        </p>
      </div>
    </div>
  );
};
