"""
HoloX - Touchless Holographic Smartphone Interface
Module 3: Voice Recognition (voice_recognition.py)

Handles:
- Microphone input via SpeechRecognition
- Speech-to-text processing
- Command detection and parsing ("open phone", "open calculator", etc.)
- Asynchronous background listening thread to maintain high UI FPS
- Graceful degradation if microphone is disconnected or unsupported
"""

import threading
import time
import speech_recognition as sr


class VoiceCommandRecognizer:
    def __init__(self, callback=None):
        """
        callback: function(recognized_text, matched_action, app_target)
        """
        self.callback = callback
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.6

        self.mic_available = False
        self.microphone = None
        self.stop_listening_fn = None
        self.is_running = False

        # State tracking
        self.last_transcript = ""
        self.last_command = ""
        self.last_action = ""
        self.status = "INITIALIZING"

        self._setup_microphone()

    def _setup_microphone(self):
        try:
            # Test default microphone
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            self.microphone = sr.Microphone()
            self.mic_available = True
            self.status = "READY"
            print("[HoloX] Microphone calibrated and ready.")
        except Exception as e:
            print(f"[HoloX] Notice: Microphone unavailable ({e}). Voice simulator mode active.")
            self.mic_available = False
            self.status = "UNAVAILABLE"

    def match_command(self, raw_text):
        """
        Maps spoken phrase to HoloX system command.
        Returns (matched_command_str, action_type, target_app)
        """
        text = raw_text.lower().strip()

        commands_map = [
            (["open phone", "phone", "dialer", "call"], "OPEN_APP", "phone"),
            (["open messages", "open message", "messages", "message", "chat", "text"], "OPEN_APP", "messages"),
            (["open calculator", "calculator", "calc"], "OPEN_APP", "calculator"),
            (["open camera", "camera", "take picture", "scanner"], "OPEN_APP", "camera"),
            (["open gallery", "gallery", "photos", "pictures"], "OPEN_APP", "gallery"),
            (["open music", "music", "play music", "player"], "OPEN_APP", "music"),
            (["show contacts", "open contacts", "contacts"], "OPEN_APP", "contacts"),
            (["open settings", "settings", "configuration"], "OPEN_APP", "settings"),
            (["go home", "home", "home screen", "main menu"], "NAVIGATE", "home"),
            (["go back", "back", "previous"], "NAVIGATE", "back"),
        ]

        for triggers, action, target in commands_map:
            for trigger in triggers:
                if trigger in text:
                    formatted_cmd = f"Open {target.capitalize()}" if action == "OPEN_APP" else f"Go {target.capitalize()}"
                    return formatted_cmd, action, target

        return text, "UNKNOWN", None

    def _audio_callback(self, recognizer, audio):
        """Called automatically when speech audio is captured"""
        try:
            transcript = recognizer.recognize_google(audio).lower()
            self.last_transcript = transcript
            cmd_name, action, target = self.match_command(transcript)

            self.last_command = cmd_name
            self.last_action = f"Opening {target.capitalize()}" if target else action

            print(f"[HoloX Voice] Heard: '{transcript}' -> Command: '{cmd_name}' (Action: {self.last_action})")

            if self.callback:
                self.callback(transcript, cmd_name, action, target)

        except sr.UnknownValueError:
            # Speech was unintelligible
            pass
        except sr.RequestError as e:
            print(f"[HoloX Voice] Recognition service error: {e}")
        except Exception as e:
            print(f"[HoloX Voice] Processing error: {e}")

    def start(self):
        """Starts background speech recognition worker"""
        if not self.mic_available:
            self.status = "SIMULATOR_ONLY"
            return

        try:
            self.is_running = True
            self.status = "LISTENING"
            self.stop_listening_fn = self.recognizer.listen_in_background(
                self.microphone,
                self._audio_callback,
                phrase_time_limit=4
            )
            print("[HoloX] Voice recognition listening in background.")
        except Exception as e:
            print(f"[HoloX] Failed to start background listener: {e}")
            self.status = "ERROR"

    def inject_simulated_command(self, phrase):
        """Allows testing or keyboard/UI triggered voice simulation"""
        self.last_transcript = phrase
        cmd_name, action, target = self.match_command(phrase)
        self.last_command = cmd_name
        self.last_action = f"Opening {target.capitalize()}" if target else action
        if self.callback:
            self.callback(phrase, cmd_name, action, target)

    def stop(self):
        self.is_running = False
        if self.stop_listening_fn:
            self.stop_listening_fn(wait_for_stop=False)
            self.stop_listening_fn = None
        self.status = "STOPPED"
