export type GestureType =
  | 'OPEN_PALM'
  | 'POINT'
  | 'PINCH'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'
  | 'FIST'
  | 'TWO_FINGER'
  | 'PALM_HOLD'
  | 'NONE';

export type ScreenId =
  | 'home'
  | 'phone'
  | 'contacts'
  | 'messages'
  | 'camera'
  | 'gallery'
  | 'music'
  | 'calculator'
  | 'calendar'
  | 'settings';

export type HoloColorTheme = 'cyan' | 'violet' | 'amber' | 'emerald';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingState {
  isActive: boolean;
  handDetected: boolean;
  landmarks: HandLandmark[];
  cursor: { x: number; y: number }; // normalized 0..1 or pixel screen coords
  currentGesture: GestureType;
  confidence: number;
  pinchDistance: number;
  isPinching: boolean;
  fps: number;
}

export interface VoiceState {
  isListening: boolean;
  supported: boolean;
  lastTranscript: string;
  recognizedCommand: string | null;
  status: 'READY' | 'LISTENING' | 'PROCESSING' | 'UNAVAILABLE' | 'ERROR';
}

export interface FeedbackEvent {
  source: 'GESTURE' | 'VOICE' | 'SYSTEM' | 'TOUCH';
  title: string;
  action: string;
  timestamp: number;
}

export interface AppConfig {
  id: ScreenId;
  name: string;
  iconName: string;
  color: string;
  badge?: string;
  description: string;
}

export interface ContactItem {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  status: 'Online' | 'In Holo-Call' | 'Standby';
  phone: string;
}

export interface MessageItem {
  id: string;
  sender: string;
  text: string;
  time: string;
  isAi: boolean;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  date: string;
  url: string;
  category: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverHue: string;
}
