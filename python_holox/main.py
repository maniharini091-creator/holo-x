"""
HoloX - Touchless Holographic Smartphone Interface
Module 6: Main Application (main.py)

Entry point:
1. Initializes HandTracker with OpenCV & MediaPipe
2. Initializes GestureRecognizer for geometry-based gesture classification
3. Initializes VoiceCommandRecognizer in background thread
4. Initializes HoloSmartphoneUI (Pygame mobile interface)
5. Connects modules via CommandController
6. Runs real-time unified loop
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

    print("\n[HoloX] System Online. Use webcam gestures and voice commands to control.")
    print("[HoloX] Press 'ESC' or close window to exit.\n")

    running = True
    while running:
        # A. Process Pygame events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                # Keyboard shortcuts for rapid testing / simulation
                elif event.key == pygame.K_h:
                    controller.navigate_to("home")
                elif event.key == pygame.K_b:
                    controller.go_back()
                elif event.key == pygame.K_p:
                    voice_engine.inject_simulated_command("open phone")
                elif event.key == pygame.K_c:
                    voice_engine.inject_simulated_command("open calculator")
                elif event.key == pygame.K_m:
                    voice_engine.inject_simulated_command("open music")

        # B. Capture webcam frame & detect hand landmarks
        has_frame, frame, landmarks, raw_lms = hand_tracker.get_frame_and_landmarks()

        if has_frame:
            # Update PIP camera view on UI
            ui.update_cam_preview(frame)
            ui.hand_status = "ACTIVE" if len(landmarks) > 0 else "SEARCHING"

            # C. Classify gestures
            gesture_name, action_name, cursor_pos, extra = gesture_engine.classify_gesture(landmarks)

            if gesture_name != "NONE":
                controller.handle_gesture(gesture_name, action_name, cursor_pos, extra)
        else:
            ui.hand_status = "OFFLINE"

        # D. Update voice status
        ui.voice_status = voice_engine.status

        # E. Render HoloX mobile interface
        ui.render()

    # Clean shutdown
    print("\n[HoloX] Shutting down...")
    voice_engine.stop()
    hand_tracker.release()
    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
