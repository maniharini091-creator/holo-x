import { AppConfig, ContactItem, GalleryPhoto, MessageItem, MusicTrack } from '../types';

export const APPS: AppConfig[] = [
  { id: 'phone', name: 'Phone', iconName: 'Phone', color: 'from-emerald-500 to-teal-600', description: 'Quantum Voice & Holo-Dialer' },
  { id: 'messages', name: 'Messages', iconName: 'MessageSquare', color: 'from-cyan-500 to-blue-600', badge: '3', description: 'Neural Comms & Encrypted Data' },
  { id: 'camera', name: 'Camera', iconName: 'Camera', color: 'from-purple-500 to-indigo-600', description: 'LiDAR Spatial Scanner' },
  { id: 'gallery', name: 'Gallery', iconName: 'Image', color: 'from-pink-500 to-rose-600', description: '3D Holographic Vault' },
  { id: 'music', name: 'Music', iconName: 'Music', color: 'from-amber-500 to-orange-600', description: 'Sonic Waveforms & Cyber Beats' },
  { id: 'calculator', name: 'Calculator', iconName: 'Calculator', color: 'from-yellow-500 to-amber-600', description: 'Matrix & Tensor Math' },
  { id: 'contacts', name: 'Contacts', iconName: 'Users', color: 'from-teal-500 to-cyan-600', description: 'Neural Identity Directory' },
  { id: 'calendar', name: 'Calendar', iconName: 'Calendar', color: 'from-indigo-500 to-violet-600', description: 'Quantum Chrono Scheduler' },
  { id: 'settings', name: 'Settings', iconName: 'Settings', color: 'from-slate-500 to-zinc-600', description: 'Holo-Projection Tuning' },
];

export const MOCK_CONTACTS: ContactItem[] = [
  { id: '1', name: 'Aria Vance', role: 'Quantum Systems Lead', avatarColor: '#00f0ff', status: 'Online', phone: '+1 (800) 465-6921' },
  { id: '2', name: 'Dr. Kaelen Cross', role: 'Cybernetics Architect', avatarColor: '#a855f7', status: 'In Holo-Call', phone: '+1 (800) 928-1144' },
  { id: '3', name: 'Nexus Orbital Dispatch', role: 'Station Hub', avatarColor: '#10b981', status: 'Online', phone: '+1 (800) 000-6000' },
  { id: '4', name: 'Samantha Reed', role: 'Neural Sync Specialist', avatarColor: '#f59e0b', status: 'Standby', phone: '+1 (800) 733-8822' },
  { id: '5', name: 'Commander Marcus Jax', role: 'Fleet Operations', avatarColor: '#ec4899', status: 'Standby', phone: '+1 (800) 412-9900' },
];

export const MOCK_MESSAGES: MessageItem[] = [
  { id: 'm1', sender: 'Nexus AI', text: 'HoloX touchless optics synchronized. Calibration variance 0.02mm.', time: '09:41 AM', isAi: true },
  { id: 'm2', sender: 'Aria Vance', text: 'Webcam hand-tracking latency is down to 14 milliseconds! Pointing and pinching feel instant.', time: '09:45 AM', isAi: false },
  { id: 'm3', sender: 'Nexus AI', text: 'Voice command engine online. Say "Open Calculator" or "Go Home" anytime.', time: '09:48 AM', isAi: true },
  { id: 'm4', sender: 'Samantha Reed', text: 'Sending the updated holographic shader maps to your local storage.', time: '09:52 AM', isAi: false },
];

export const MOCK_TRACKS: MusicTrack[] = [
  { id: 't1', title: 'Cybernetic Horizon', artist: 'Nexus Synthwaves', duration: '3:42', coverHue: '#00f0ff' },
  { id: 't2', title: 'Neon Pulse Matrix', artist: 'HoloX Collective', duration: '4:18', coverHue: '#a855f7' },
  { id: 't3', title: 'Quantum Drift', artist: 'Starlight Zero', duration: '2:56', coverHue: '#f59e0b' },
  { id: 't4', title: 'Orbital Resonance', artist: 'Aria Vance', duration: '5:04', coverHue: '#10b981' },
];

export const MOCK_GALLERY: GalleryPhoto[] = [
  {
    id: 'g1',
    title: 'HoloX Optical Core',
    date: 'OCT 2026',
    category: 'Hardware',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'g2',
    title: 'Cyber City Skylines',
    date: 'NOV 2026',
    category: 'Spatial',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'g3',
    title: 'Quantum Field Visualizer',
    date: 'DEC 2026',
    category: 'Optics',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'g4',
    title: 'Neural Matrix Sync',
    date: 'JAN 2027',
    category: 'Synapse',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  },
];
