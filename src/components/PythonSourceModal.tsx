import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Download } from 'lucide-react';

interface PythonSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PYTHON_FILES: Record<string, { desc: string; code: string }> = {
  'main.py': {
    desc: 'Starts webcam, hand tracking, voice recognition, and connects all modules',
    code: `"""
HoloX - Touchless Holographic Smartphone Interface
Module 6: Main Application (main.py)
"""
import sys
import time
import pygame

from hand_tracking import HandTracker
from gesture_recognition import GestureRecognizer
from voice_recognition import VoiceCommandRecognizer
from command_controller import CommandController
from holo_ui import HoloSmartphoneUI

def main():
    print("=========================================================")
    print("  HoloX – Touchless Holographic Smartphone Interface     ")
    print("  Webcam Hand Tracking + Microphone Voice Control       ")
    print("=========================================================")

    # 1. Initialize UI (Pygame mobile interface)
    ui = HoloSmartphoneUI(width=1280, height=720)

    # 2. Initialize Command Controller
    controller = CommandController(ui)
    ui.set_command_controller(controller)

    # 3. Initialize Hand Tracker & Gesture Engine
    hand_tracker = HandTracker(camera_id=0)
    gesture_engine = GestureRecognizer()

    # 4. Initialize Voice Recognition with direct command routing
    def on_voice_command(raw_transcript, cmd_name, action_type, target):
        controller.handle_voice_command(raw_transcript, cmd_name, action_type, target)

    voice_engine = VoiceCommandRecognizer(callback=on_voice_command)
    voice_engine.start()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False

        # Capture webcam frame & detect hand landmarks
        has_frame, frame, landmarks, raw_lms = hand_tracker.get_frame_and_landmarks()

        if has_frame:
            ui.update_cam_preview(frame)
            ui.hand_status = "ACTIVE" if len(landmarks) > 0 else "SEARCHING"

            # Classify gestures
            gesture_name, action_name, cursor_pos, extra = gesture_engine.classify_gesture(landmarks)
            if gesture_name != "NONE":
                controller.handle_gesture(gesture_name, action_name, cursor_pos, extra)
        else:
            ui.hand_status = "OFFLINE"

        ui.voice_status = voice_engine.status
        ui.render()

    voice_engine.stop()
    hand_tracker.release()
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
  },
  'hand_tracking.py': {
    desc: 'OpenCV camera capture, MediaPipe Hand detection, landmark extraction',
    code: `"""
HoloX - Module 1: Hand Tracking (hand_tracking.py)
"""
import cv2
import mediapipe as mp
import numpy as np

class HandTracker:
    def __init__(self, camera_id=0, max_hands=1, detection_con=0.7, track_con=0.6):
        self.camera_id = camera_id
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_hands,
            min_detection_confidence=detection_con,
            min_tracking_confidence=track_con
        )
        self.mp_draw = mp.solutions.drawing_utils
        self.cap = cv2.VideoCapture(self.camera_id)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    def get_frame_and_landmarks(self):
        if not self.cap or not self.cap.isOpened():
            return False, None, [], None

        ret, frame = self.cap.read()
        if not ret:
            return False, None, [], None

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)

        landmarks = []
        raw_landmarks = None
        if results.multi_hand_landmarks:
            raw_landmarks = results.multi_hand_landmarks[0]
            for lm_id, lm in enumerate(raw_landmarks.landmark):
                landmarks.append({
                    "id": lm_id,
                    "x": int(lm.x * w),
                    "y": int(lm.y * h),
                    "norm_x": lm.x,
                    "norm_y": lm.y,
                    "norm_z": lm.z
                })
            self.mp_draw.draw_landmarks(frame, raw_landmarks, self.mp_hands.HAND_CONNECTIONS)

        return True, frame, landmarks, raw_landmarks

    def release(self):
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()`,
  },
  'gesture_recognition.py': {
    desc: 'Detects and classifies all 8 gestures (Palm, Point, Pinch, Swipes, Fist, etc.)',
    code: `"""
HoloX - Module 2: Gesture Recognition (gesture_recognition.py)
"""
import math
import time
from collections import deque

class GestureRecognizer:
    def __init__(self):
        self.wrist_history = deque(maxlen=10)
        self.last_swipe_time = 0
        self.palm_start_time = None

    def _euclidean_dist(self, p1, p2):
        return math.sqrt((p1["x"] - p2["x"])**2 + (p1["y"] - p2["y"])**2)

    def _is_finger_extended(self, landmarks, tip_id, pip_id):
        dist_tip_wrist = self._euclidean_dist(landmarks[tip_id], landmarks[0])
        dist_pip_wrist = self._euclidean_dist(landmarks[pip_id], landmarks[0])
        return dist_tip_wrist > dist_pip_wrist * 1.15

    def classify_gesture(self, landmarks):
        if not landmarks or len(landmarks) < 21:
            return "NONE", "NONE", None, {}

        now = time.time()
        self.wrist_history.append((landmarks[0]["x"], landmarks[0]["y"], now))
        cursor_pos = (landmarks[8]["x"], landmarks[8]["y"])

        scale = max(self._euclidean_dist(landmarks[0], landmarks[9]), 20.0)
        pinch_dist = self._euclidean_dist(landmarks[4], landmarks[8])
        is_pinching = pinch_dist < (scale * 0.35)

        is_idx = self._is_finger_extended(landmarks, 8, 6)
        is_mid = self._is_finger_extended(landmarks, 12, 10)
        is_rng = self._is_finger_extended(landmarks, 16, 14)
        is_pnk = self._is_finger_extended(landmarks, 20, 18)

        # 1. Swipe Left / Right
        if len(self.wrist_history) >= 6 and (now - self.last_swipe_time > 0.6):
            dx = self.wrist_history[-1][0] - self.wrist_history[0][0]
            dt = self.wrist_history[-1][2] - self.wrist_history[0][2]
            if dt > 0:
                vx = dx / dt
                if vx < -650:
                    self.last_swipe_time = now
                    return "SWIPE_LEFT", "NEXT_PAGE", cursor_pos, {}
                elif vx > 650:
                    self.last_swipe_time = now
                    return "SWIPE_RIGHT", "PREV_PAGE", cursor_pos, {}

        # 2. Pinch -> Click
        if is_pinching:
            return "PINCH", "SELECT", cursor_pos, {"dist": pinch_dist}

        # 3. Fist -> Back
        if not is_idx and not is_mid and not is_rng and not is_pnk:
            return "FIST", "BACK", cursor_pos, {}

        # 4. Two Finger -> Menu
        if is_idx and is_mid and not is_rng and not is_pnk:
            return "TWO_FINGER", "OPEN_MENU", cursor_pos, {}

        # 5. Point -> Move Cursor
        if is_idx and not is_mid and not is_rng and not is_pnk:
            return "POINT", "MOVE_CURSOR", cursor_pos, {}

        # 6. Palm & Palm Hold
        if is_idx and is_mid and is_rng and is_pnk:
            if self.palm_start_time is None:
                self.palm_start_time = now
            if (now - self.palm_start_time) > 1.2:
                return "PALM_HOLD", "HOME_SCREEN", cursor_pos, {}
            return "OPEN_PALM", "MOVE_MODE", cursor_pos, {}

        self.palm_start_time = None
        return "GENERIC_HAND", "TRACKING", cursor_pos, {}`,
  },
  'voice_recognition.py': {
    desc: 'Microphone input, Speech-to-text, commands parser in background thread',
    code: `"""
HoloX - Module 3: Voice Recognition (voice_recognition.py)
"""
import speech_recognition as sr

class VoiceCommandRecognizer:
    def __init__(self, callback=None):
        self.callback = callback
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.status = "READY"
        self.stop_fn = None

    def match_command(self, raw_text):
        text = raw_text.lower().strip()
        commands = [
            (["open phone", "phone", "dialer"], "OPEN_APP", "phone"),
            (["open messages", "messages", "chat"], "OPEN_APP", "messages"),
            (["open calculator", "calculator"], "OPEN_APP", "calculator"),
            (["open camera", "camera"], "OPEN_APP", "camera"),
            (["open gallery", "gallery"], "OPEN_APP", "gallery"),
            (["open music", "music"], "OPEN_APP", "music"),
            (["show contacts", "contacts"], "OPEN_APP", "contacts"),
            (["open settings", "settings"], "OPEN_APP", "settings"),
            (["go home", "home"], "NAVIGATE", "home"),
            (["go back", "back"], "NAVIGATE", "back"),
        ]
        for triggers, action, target in commands:
            for t in triggers:
                if t in text:
                    return f"Open {target.capitalize()}", action, target
        return text, "UNKNOWN", None

    def _callback(self, recognizer, audio):
        try:
            transcript = recognizer.recognize_google(audio)
            cmd, action, target = self.match_command(transcript)
            if self.callback:
                self.callback(transcript, cmd, action, target)
        except Exception:
            pass

    def start(self):
        try:
            mic = sr.Microphone()
            self.stop_fn = self.recognizer.listen_in_background(mic, self._callback)
            self.status = "READY"
        except Exception:
            self.status = "SIMULATOR_ONLY"

    def stop(self):
        if self.stop_fn:
            self.stop_fn(wait_for_stop=False)`,
  },
  'command_controller.py': {
    desc: 'Unifies gesture and voice commands and updates smartphone screen stack',
    code: `"""
HoloX - Module 4: Command Controller (command_controller.py)
"""
import time

class CommandController:
    def __init__(self, ui):
        self.ui = ui
        self.current_screen = "home"
        self.screen_history = []
        self.last_action_time = 0

    def handle_gesture(self, gesture, action, cursor_pos, extra):
        now = time.time()
        if cursor_pos:
            self.ui.update_virtual_cursor(cursor_pos[0], cursor_pos[1])

        if gesture == "PINCH" and (now - self.last_action_time > 0.4):
            self.last_action_time = now
            self.ui.simulate_click(cursor_pos[0], cursor_pos[1])
        elif gesture == "FIST" and (now - self.last_action_time > 0.8):
            self.last_action_time = now
            self.go_back()
        elif gesture == "PALM_HOLD" and (now - self.last_action_time > 0.8):
            self.last_action_time = now
            self.navigate_to("home")
        elif gesture == "SWIPE_LEFT" and (now - self.last_action_time > 0.6):
            self.last_action_time = now
            self.ui.next_tab_or_item()
        elif gesture == "SWIPE_RIGHT" and (now - self.last_action_time > 0.6):
            self.last_action_time = now
            self.ui.prev_tab_or_item()

    def handle_voice_command(self, transcript, cmd_name, action_type, target):
        if action_type == "OPEN_APP" and target:
            self.navigate_to(target)
        elif action_type == "NAVIGATE":
            if target == "home":
                self.navigate_to("home")
            elif target == "back":
                self.go_back()

    def navigate_to(self, screen_name):
        if screen_name != "home":
            self.screen_history.append(self.current_screen)
        self.current_screen = screen_name
        self.ui.switch_screen(screen_name)

    def go_back(self):
        if self.screen_history:
            prev = self.screen_history.pop()
            self.current_screen = prev
            self.ui.switch_screen(prev)
        else:
            self.current_screen = "home"
            self.ui.switch_screen("home")`,
  },
  'requirements.txt': {
    desc: 'Python package dependencies for OpenCV, MediaPipe, SpeechRecognition, Pygame',
    code: `opencv-python>=4.8.0
mediapipe>=0.10.9
SpeechRecognition>=3.10.0
PyAudio>=0.2.13
pygame>=2.5.2
numpy>=1.24.0`,
  },
};

export const PythonSourceModal: React.FC<PythonSourceModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentModule = PYTHON_FILES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentModule.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([currentModule.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-orbitron text-white">
                Python Architecture Modules
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Standalone code for running locally with laptop webcam & microphone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 hover:text-white cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-mono font-bold text-slate-950 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD FILE</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto custom-scrollbar">
          {Object.keys(PYTHON_FILES).map((fname) => (
            <button
              key={fname}
              onClick={() => setSelectedFile(fname)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedFile === fname
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fname}</span>
            </button>
          ))}
        </div>

        {/* File description */}
        <div className="px-4 py-2 bg-slate-900/90 text-xs font-mono text-slate-300 border-b border-slate-800/80 flex items-center justify-between">
          <span>{currentModule.desc}</span>
          <span className="text-slate-500">python 3.9+</span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 custom-scrollbar leading-relaxed">
          <pre>
            <code>{currentModule.code}</code>
          </pre>
        </div>

        {/* Footer instructions */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-4">
          <span>Local execution: <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">pip install -r requirements.txt</code></span>
          <span>Launch: <code className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">python main.py</code></span>
        </div>
      </div>
    </div>
  );
};
