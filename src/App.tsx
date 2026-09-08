/**
 * HoloX – Touchless Holographic Smartphone Interface Prototype
 * Controlled via Laptop Webcam Hand Tracking & Microphone Voice Commands
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenId, HoloColorTheme, GestureType, HandTrackingState, VoiceState, FeedbackEvent } from './types';
import { HoloPhone } from './components/HoloPhone';
import { CameraPipPanel } from './components/CameraPipPanel';
import { VoiceStatusHud } from './components/VoiceStatusHud';
import { GestureBannerHud } from './components/GestureBannerHud';
import { GestureGuideModal } from './components/GestureGuideModal';
import { PythonSourceModal } from './components/PythonSourceModal';
import { GestureClassifier } from './services/gestureClassifier';
import { voiceService } from './services/voiceService';
import { soundFx } from './services/soundFx';
import {
  Sparkles,
  HelpCircle,
  Code,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Hand,
  Mic,
  Cpu,
  Radio,
  Layers
} from 'lucide-react';

export default function App() {
  // Navigation stack
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);

  // Appearance & Hardware Configuration
  const [colorTheme, setColorTheme] = useState<HoloColorTheme>('cyan');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pipEnabled, setPipEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(85);

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);

  // Webcam & Hand Tracking
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Hand Tracking & Cursor State
  const [handState, setHandState] = useState<HandTrackingState>({
    isActive: false,
    handDetected: false,
    landmarks: [],
    cursor: { x: 0.5, y: 0.5 },
    currentGesture: 'NONE',
    confidence: 0,
    pinchDistance: 1,
    isPinching: false,
    fps: 60,
  });

  // Voice State
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    supported: true,
    lastTranscript: '',
    recognizedCommand: null,
    status: 'READY',
  });

  // HUD Feedback Banners
  const [lastEvent, setLastEvent] = useState<FeedbackEvent | null>({
    source: 'SYSTEM',
    title: 'HOLOX ONLINE',
    action: 'GESTURE & VOICE SYNC ACTIVE',
    timestamp: Date.now(),
  });
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>('Open Calculator');
  const [lastVoiceAction, setLastVoiceAction] = useState<string | null>('Ready for voice input');
  const [gestureAction, setGestureAction] = useState<string>('MOVE / SELECT MODE');

  // Classifier instance
  const classifierRef = useRef<GestureClassifier>(new GestureClassifier());
  const lastActionTimeRef = useRef<number>(0);

  // -------------------------------------------------------------
  // Navigation Methods
  // -------------------------------------------------------------
  const navigateTo = useCallback(
    (screen: ScreenId) => {
      if (screen === currentScreen) return;
      setScreenHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(screen);
      soundFx.playPinchSelect();
    },
    [currentScreen]
  );

  const goBack = useCallback(() => {
    soundFx.playBack();
    setScreenHistory((prev) => {
      if (prev.length === 0) {
        setCurrentScreen('home');
        return [];
      }
      const nextStack = [...prev];
      const previousScreen = nextStack.pop() || 'home';
      setCurrentScreen(previousScreen);
      return nextStack;
    });
  }, []);

  // -------------------------------------------------------------
  // Voice Recognition Initialization & Callbacks
  // -------------------------------------------------------------
  useEffect(() => {
    voiceService.setCallbacks(
      (match, rawTranscript) => {
        setLastVoiceCommand(match.commandLabel);
        setLastVoiceAction(match.actionLabel);
        setVoiceState((prev) => ({
          ...prev,
          lastTranscript: rawTranscript,
          recognizedCommand: match.commandLabel,
        }));

        setLastEvent({
          source: 'VOICE',
          title: `Command: ${match.commandLabel}`,
          action: match.actionLabel,
          timestamp: Date.now(),
        });

        // Dispatch matched action
        if (match.actionType === 'NAVIGATE' && match.screenTarget) {
          navigateTo(match.screenTarget);
        } else if (match.actionType === 'HOME') {
          setCurrentScreen('home');
          soundFx.playPinchSelect();
        } else if (match.actionType === 'BACK') {
          goBack();
        }
      },
      (status, transcript) => {
        setVoiceState((prev) => ({
          ...prev,
          status,
          isListening: status === 'LISTENING' || status === 'PROCESSING',
          lastTranscript: transcript || prev.lastTranscript,
        }));
      }
    );

    if (voiceEnabled) {
      voiceService.start();
    }

    return () => {
      voiceService.stop();
    };
  }, [voiceEnabled, navigateTo, goBack]);

  const toggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (nextState) {
      voiceService.start();
    } else {
      voiceService.stop();
    }
  };

  const handleSimulateVoiceCommand = (commandStr: string) => {
    voiceService.processPhrase(commandStr);
  };

  // -------------------------------------------------------------
  // Webcam & MediaPipe Hand Tracking Setup
  // -------------------------------------------------------------
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
        setWebcamStream(stream);
        setIsWebcamActive(true);

        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.srcObject = stream;
          hiddenVideoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('[HoloX] Webcam permission not granted or device unavailable:', err);
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
  };

  const toggleWebcam = () => {
    if (isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Auto-start webcam on mount if permissions allow
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  // -------------------------------------------------------------
  // MediaPipe Hands Integration & Landmark Extraction Loop
  // -------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;
    let mediapipeHands: any = null;
    let cameraInstance: any = null;

    // Check if window.Hands is loaded from index.html MediaPipe scripts
    const initMediaPipe = () => {
      const win = window as any;
      if (win.Hands && isWebcamActive && hiddenVideoRef.current) {
        try {
          mediapipeHands = new win.Hands({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          mediapipeHands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.65,
            minTrackingConfidence: 0.6,
          });

          mediapipeHands.onResults((results: any) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const rawLms = results.multiHandLandmarks[0];
              processLandmarks(rawLms);
            } else {
              setHandState((prev) => ({
                ...prev,
                handDetected: false,
                currentGesture: 'NONE',
              }));
            }
          });

          if (win.Camera) {
            cameraInstance = new win.Camera(hiddenVideoRef.current, {
              onFrame: async () => {
                if (hiddenVideoRef.current && mediapipeHands) {
                  await mediapipeHands.send({ image: hiddenVideoRef.current });
                }
              },
              width: 640,
              height: 480,
            });
            cameraInstance.start();
          }
        } catch (e) {
          console.warn('[HoloX] MediaPipe Hands init warning:', e);
        }
      }
    };

    initMediaPipe();

    // Fallback simulated tracking loop if MediaPipe CDN is loading or offline
    let lastSimTime = Date.now();
    const fallbackLoop = () => {
      // Keep real-time responsive timer
      animationFrameId = requestAnimationFrame(fallbackLoop);
    };
    animationFrameId = requestAnimationFrame(fallbackLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (cameraInstance) {
        try {
          cameraInstance.stop();
        } catch {}
      }
      if (mediapipeHands) {
        try {
          mediapipeHands.close();
        } catch {}
      }
    };
  }, [isWebcamActive]);

  // Process Landmarks into Gestures & Virtual Pointer
  const processLandmarks = (rawLandmarks: any[]) => {
    const lms = rawLandmarks.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z || 0 }));
    const result = classifierRef.current.classify(lms);

    setHandState({
      isActive: true,
      handDetected: true,
      landmarks: lms,
      cursor: result.cursor,
      currentGesture: result.gesture,
      confidence: result.confidence,
      pinchDistance: result.pinchDistance,
      isPinching: result.isPinching,
      fps: 60,
    });

    setGestureAction(result.action);

    // Coordinate gesture dispatch
    handleGestureAction(result.gesture, result.action, result.cursor);
  };

  // -------------------------------------------------------------
  // Gesture Command Dispatcher
  // -------------------------------------------------------------
  const handleGestureAction = (
    gesture: GestureType,
    action: string,
    cursor: { x: number; y: number }
  ) => {
    const now = Date.now();

    if (gesture === 'NONE') return;

    // PINCH -> Select / Click
    if (gesture === 'PINCH') {
      if (now - lastActionTimeRef.current > 450) {
        lastActionTimeRef.current = now;
        soundFx.playPinchSelect();
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: PINCH',
          action: 'Action: SELECT',
          timestamp: now,
        });

        // Trigger simulated click on active element or coordinates
        dispatchHoloClick(cursor.x, cursor.y);
      }
    }

    // FIST -> Back
    else if (gesture === 'FIST') {
      if (now - lastActionTimeRef.current > 800) {
        lastActionTimeRef.current = now;
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: FIST',
          action: 'Action: GO BACK',
          timestamp: now,
        });
        goBack();
      }
    }

    // PALM_HOLD -> Home Screen
    else if (gesture === 'PALM_HOLD') {
      if (now - lastActionTimeRef.current > 1000) {
        lastActionTimeRef.current = now;
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: PALM HOLD',
          action: 'Action: GO HOME',
          timestamp: now,
        });
        setCurrentScreen('home');
        soundFx.playPinchSelect();
      }
    }

    // SWIPE_LEFT -> Next Page / Cycle
    else if (gesture === 'SWIPE_LEFT') {
      if (now - lastActionTimeRef.current > 600) {
        lastActionTimeRef.current = now;
        soundFx.playSwipe();
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: SWIPE LEFT',
          action: 'Action: NEXT PAGE',
          timestamp: now,
        });
        // Cycle apps forwards
        cycleApp(1);
      }
    }

    // SWIPE_RIGHT -> Previous Page / Cycle
    else if (gesture === 'SWIPE_RIGHT') {
      if (now - lastActionTimeRef.current > 600) {
        lastActionTimeRef.current = now;
        soundFx.playSwipe();
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: SWIPE RIGHT',
          action: 'Action: PREVIOUS PAGE',
          timestamp: now,
        });
        // Cycle apps backwards
        cycleApp(-1);
      }
    }

    // TWO_FINGER -> Open Menu (Home)
    else if (gesture === 'TWO_FINGER') {
      if (now - lastActionTimeRef.current > 700) {
        lastActionTimeRef.current = now;
        setLastEvent({
          source: 'GESTURE',
          title: 'Detected Gesture: TWO FINGERS',
          action: 'Action: OPEN MENU',
          timestamp: now,
        });
        setCurrentScreen('home');
      }
    }
  };

  const cycleApp = (direction: number) => {
    const appsList: ScreenId[] = [
      'home',
      'phone',
      'messages',
      'calculator',
      'camera',
      'gallery',
      'music',
      'contacts',
      'calendar',
      'settings',
    ];
    const currentIndex = appsList.indexOf(currentScreen);
    const nextIndex = (currentIndex + direction + appsList.length) % appsList.length;
    setCurrentScreen(appsList[nextIndex]);
  };

  // Dispatches click at virtual cursor position
  const dispatchHoloClick = (normX: number, normY: number) => {
    const phoneEl = document.getElementById('holo-smartphone-frame');
    if (!phoneEl) return;

    const rect = phoneEl.getBoundingClientRect();
    const clickX = rect.left + normX * rect.width;
    const clickY = rect.top + normY * rect.height;

    const el = document.elementFromPoint(clickX, clickY) as HTMLElement | null;
    if (el) {
      el.click();
    }
  };

  // Simulate gesture trigger directly (e.g. from UI buttons or testing)
  const handleSimulateGesture = (gesture: GestureType) => {
    const actionMap: Record<GestureType, string> = {
      OPEN_PALM: 'MOVE / SELECT MODE',
      POINT: 'MOVE CURSOR',
      PINCH: 'SELECT',
      SWIPE_LEFT: 'NEXT PAGE',
      SWIPE_RIGHT: 'PREVIOUS PAGE',
      FIST: 'GO BACK',
      TWO_FINGER: 'OPEN MENU',
      PALM_HOLD: 'HOME SCREEN',
      NONE: 'NONE',
    };

    setHandState((prev) => ({
      ...prev,
      currentGesture: gesture,
      handDetected: true,
      isActive: true,
      isPinching: gesture === 'PINCH',
    }));

    handleGestureAction(gesture, actionMap[gesture], handState.cursor);
  };

  // Toggle Sound FX
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Hidden video element for MediaPipe frame analysis */}
      <video
        ref={hiddenVideoRef}
        playsInline
        muted
        className="hidden"
        width={640}
        height={480}
      />

      {/* Cyberpunk Hologram Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,240,255,0.15) 0%, transparent 60%), linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          }}
        />
      </div>

      {/* Top Application Header */}
      <header className="relative w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-lg px-4 py-3 z-30 flex items-center justify-between">
        {/* Brand & HoloX Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black font-orbitron tracking-wider text-white">
                Holo<span className="text-cyan-400">X</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-[10px] font-mono font-bold text-cyan-300">
                PROTOTYPE v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Touchless Holographic Smartphone Interface • Hand Tracking & Voice Commands
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Haptic Audio' : 'Unmute Haptic Audio'}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Gesture Reference Guide Modal Trigger */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gesture Guide</span>
          </button>

          {/* Python Architecture Code Modal Trigger */}
          <button
            onClick={() => setShowPythonModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-mono font-bold text-white cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python Source</span>
          </button>
        </div>
      </header>

      {/* Real-Time Detected Gesture & Voice Command HUD Banner */}
      <GestureBannerHud
        lastEvent={lastEvent}
        detectedGesture={handState.currentGesture}
        gestureAction={gestureAction}
        lastVoiceCommand={lastVoiceCommand}
        lastVoiceAction={lastVoiceAction}
      />

      {/* Main Prototype Workspace */}
      <main className="relative flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 px-4 py-2 z-20 max-w-7xl mx-auto w-full">
        {/* Left Side: Voice Recognition Hub & Command Triggers */}
        <div className="w-full lg:w-auto flex flex-col items-center justify-center order-2 lg:order-1">
          <VoiceStatusHud
            voiceState={voiceState}
            onToggleVoice={toggleVoice}
            onSimulateCommand={handleSimulateVoiceCommand}
          />
        </div>

        {/* Center: The Futuristic Holographic Smartphone */}
        <div className="order-1 lg:order-2 flex-shrink-0">
          <HoloPhone
            currentScreen={currentScreen}
            onNavigate={navigateTo}
            onBack={goBack}
            colorTheme={colorTheme}
            cursorPos={handState.cursor}
            isPinching={handState.isPinching}
            webcamStream={webcamStream}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            voiceEnabled={voiceEnabled}
            onToggleVoice={toggleVoice}
            pipEnabled={pipEnabled}
            onTogglePip={() => setPipEnabled((p) => !p)}
            sensitivity={sensitivity}
            onChangeSensitivity={setSensitivity}
            currentGesture={handState.currentGesture}
          />
        </div>

        {/* Right Side: Camera / Hand Tracking Preview PIP */}
        <div className="w-full lg:w-auto flex flex-col items-center justify-center order-3">
          {pipEnabled && (
            <CameraPipPanel
              webcamStream={webcamStream}
              handState={handState}
              voiceState={voiceState}
              isWebcamActive={isWebcamActive}
              onToggleWebcam={toggleWebcam}
              onSimulateGesture={handleSimulateGesture}
            />
          )}
        </div>
      </main>

      {/* Bottom Global Status Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 px-4 py-2.5 z-30 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold">System Status: ONLINE</span>
          </div>
          <div className="hidden sm:inline text-slate-600">|</div>
          <div className="flex items-center gap-1">
            <Hand className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hand Tracking: {handState.isActive && handState.handDetected ? 'ACTIVE' : 'READY'}</span>
          </div>
          <div className="hidden sm:inline text-slate-600">|</div>
          <div className="flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice Recognition: {voiceState.isListening ? 'LISTENING' : 'READY'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Laptop Webcam & Mic Synced</span>
          <button
            onClick={() => {
              setCurrentScreen('home');
              soundFx.playBack();
            }}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Home</span>
          </button>
        </div>
      </footer>

      {/* Gesture Guide Reference Modal */}
      <GestureGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelectGesture={handleSimulateGesture}
      />

      {/* Python Architecture Code Modal */}
      <PythonSourceModal
        isOpen={showPythonModal}
        onClose={() => setShowPythonModal(false)}
      />
    </div>
  );
}
