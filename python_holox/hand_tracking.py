"""
HoloX - Touchless Holographic Smartphone Interface
Module 1: Hand Tracking (hand_tracking.py)

Handles:
- OpenCV camera initialization and frame capture
- MediaPipe Hands detector setup
- Hand landmark extraction and coordinate normalization
- Robust error handling for camera availability
"""

import cv2
import mediapipe as mp
import numpy as np


class HandTracker:
    def __init__(self, camera_id=0, max_hands=1, detection_con=0.7, track_con=0.6):
        self.camera_id = camera_id
        self.max_hands = max_hands
        self.detection_con = detection_con
        self.track_con = track_con

        # Initialize MediaPipe Hands solution
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=self.max_hands,
            min_detection_confidence=self.detection_con,
            min_tracking_confidence=self.track_con
        )
        self.mp_draw = mp.solutions.drawing_utils
        self.mp_draw_styles = mp.solutions.drawing_styles

        # Initialize VideoCapture with error handling
        self.cap = None
        self.camera_ready = self._init_camera()

        # State cache
        self.landmarks = []
        self.raw_landmarks = None
        self.handedness = "Right"

    def _init_camera(self):
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                print(f"[HoloX] Warning: Camera ID {self.camera_id} could not be opened.")
                return False
            # Optimize resolution for real-time responsiveness
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            print("[HoloX] Hand tracking camera initialized successfully.")
            return True
        except Exception as e:
            print(f"[HoloX] Camera initialization error: {e}")
            return False

    def get_frame_and_landmarks(self):
        """
        Reads a frame, flips horizontally for natural mirror feel,
        detects hand landmarks, and returns:
        (success, frame, landmarks_list, raw_hand_landmarks)
        """
        if not self.camera_ready or self.cap is None:
            # Generate a blank fallback frame if camera is unavailable
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(blank, "CAMERA OFFLINE - CHECK WEBCAM", (120, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            return False, blank, [], None

        ret, frame = self.cap.read()
        if not ret:
            return False, frame, [], None

        # Flip horizontally for selfie-mirror view
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)

        self.landmarks = []
        self.raw_landmarks = None

        if results.multi_hand_landmarks:
            # Pick first detected hand
            hand_landmarks = results.multi_hand_landmarks[0]
            self.raw_landmarks = hand_landmarks

            # Extract handedness if available
            if results.multi_handedness:
                self.handedness = results.multi_handedness[0].classification[0].label

            # Extract pixel & normalized coordinates for all 21 landmarks
            for lm_id, lm in enumerate(hand_landmarks.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                self.landmarks.append({
                    "id": lm_id,
                    "x": cx,
                    "y": cy,
                    "norm_x": lm.x,
                    "norm_y": lm.y,
                    "norm_z": lm.z
                })

            # Draw holographic neon landmark connections on preview frame
            self.mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                self.mp_hands.HAND_CONNECTIONS,
                self.mp_draw_styles.get_default_hand_landmarks_style(),
                self.mp_draw_styles.get_default_hand_connections_style()
            )

        return True, frame, self.landmarks, self.raw_landmarks

    def release(self):
        if self.cap and self.cap.isOpened():
            self.cap.release()
        cv2.destroyAllWindows()
