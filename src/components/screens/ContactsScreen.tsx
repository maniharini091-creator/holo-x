import React, { useState } from 'react';
import { MOCK_CONTACTS } from '../../data/mockData';
import { ContactItem } from '../../types';
import { Search, Phone, MessageSquare, Shield, UserPlus } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

interface ContactsScreenProps {
  onCallContact: (contact: ContactItem) => void;
  onMessageContact: (contact: ContactItem) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ onCallContact, onMessageContact }) => {
  const [search, setSearch] = useState('');
  const [contacts] = useState<ContactItem[]>(MOCK_CONTACTS);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">Neural Contacts</h2>
          <p className="text-[9px] font-mono text-slate-400">5 ENCRYPTED MESH IDENTITIES</p>
        </div>
        <button
          onClick={() => soundFx.playPinchSelect()}
          className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/80 flex items-center justify-center text-cyan-300 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="my-2 relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter holo-identities..."
          className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none font-mono"
        />
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filtered.map((c) => (
          <div
            key={c.id}
            id={`contact-${c.id}`}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow-sm"
                style={{ backgroundColor: c.avatarColor }}
              >
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-orbitron">{c.name}</h4>
                <p className="text-[9px] font-mono text-slate-400">{c.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      c.status === 'Online'
                        ? 'bg-emerald-400'
                        : c.status === 'In Holo-Call'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-[8px] font-mono text-slate-400">{c.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFx.playPinchSelect();
                  onCallContact(c);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-400 text-emerald-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundFx.playPinchSelect();
                  onMessageContact(c);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-cyan-600/30 border border-slate-700 hover:border-cyan-400 text-cyan-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center text-[9px] font-mono text-slate-500">
        Say <span className="text-cyan-300">"Open Phone"</span> to dial directly
      </div>
    </div>
  );
};
