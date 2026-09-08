"""
HoloX - Touchless Holographic Smartphone Interface
Module 2: Gesture Recognition (gesture_recognition.py)

Classifies 8 core gestures using lightweight landmark geometry:
1. OPEN_PALM      -> Move / Select mode
2. POINT          -> Move cursor (Index extended, others curled)
3. PINCH          -> Click / Select (Thumb tip + Index tip close)
4. SWIPE_LEFT     -> Next page (Rapid horizontal hand movement to left)
5. SWIPE_RIGHT    -> Previous page (Rapid horizontal hand movement to right)
6. FIST           -> Back (All fingers curled)
7. TWO_FINGER     -> Open menu (Index + Middle extended)
8. PALM_HOLD      -> Home screen (Open palm stationary for > 1.2s)
"""

import math
import time
from collections import deque


class GestureRecognizer:
    def __init__(self):
        # Buffer for velocity tracking and swipe detection
        self.wrist_history = deque(maxlen=10)
        self.last_swipe_time = 0
        self.swipe_cooldown = 0.6  # seconds

        # Palm hold tracking for Home action
        self.palm_start_time = None
        self.palm_hold_threshold = 1.2  # seconds

        # Click / Pinch debounce
        self.last_pinch_state = False
        self.last_click_time = 0

    def _euclidean_dist(self, p1, p2):
        return math.sqrt((p1["x"] - p2["x"])**2 + (p1["y"] - p2["y"])**2)

    def _is_finger_extended(self, landmarks, tip_id, pip_id, mcp_id):
        """
        Determines if a finger is extended comparing tip position relative to PIP and MCP joints.
        In camera coordinates (y grows downward), an extended finger usually has tip.y < pip.y.
        """
        tip = landmarks[tip_id]
        pip = landmarks[pip_id]
        mcp = landmarks[mcp_id]
        wrist = landmarks[0]

        # Check distance from wrist as a robust orientation-invariant measure
        dist_tip_wrist = self._euclidean_dist(tip, wrist)
        dist_pip_wrist = self._euclidean_dist(pip, wrist)
        return dist_tip_wrist > dist_pip_wrist * 1.15

    def classify_gesture(self, landmarks):
        """
        Analyzes 21 landmarks and returns (gesture_name, action_name, cursor_pos, extra_data)
        """
        if not landmarks or len(landmarks) < 21:
            self.wrist_history.clear()
            self.palm_start_time = None
            return "NONE", "NONE", None, {}

        current_time = time.time()
        wrist = landmarks[0]
        self.wrist_history.append((wrist["x"], wrist["y"], current_time))

        # Finger extension states
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]

        # Reference scale: distance between wrist and middle MCP
        scale = max(self._euclidean_dist(landmarks[0], landmarks[9]), 20.0)

        is_thumb_ext = self._euclidean_dist(thumb_tip, landmarks[2]) > (scale * 0.55)
        is_index_ext = self._is_finger_extended(landmarks, 8, 6, 5)
        is_middle_ext = self._is_finger_extended(landmarks, 12, 10, 9)
        is_ring_ext = self._is_finger_extended(landmarks, 16, 14, 13)
        is_pinky_ext = self._is_finger_extended(landmarks, 20, 18, 17)

        # Virtual cursor mapped to index fingertip or center of hand
        cursor_pos = (index_tip["x"], index_tip["y"])

        # Check for Pinch (Thumb tip and Index tip close together)
        pinch_dist = self._euclidean_dist(thumb_tip, index_tip)
        pinch_threshold = scale * 0.35  # Dynamic threshold proportional to hand distance
        is_pinching = pinch_dist < pinch_threshold

        # 1. SWIPE DETECTION (Horizontal velocity)
        if len(self.wrist_history) >= 6 and (current_time - self.last_swipe_time > self.swipe_cooldown):
            dx = self.wrist_history[-1][0] - self.wrist_history[0][0]
            dt = self.wrist_history[-1][2] - self.wrist_history[0][2]
            if dt > 0:
                vx = dx / dt  # pixels per second
                if vx < -650:  # Rapid movement left
                    self.last_swipe_time = current_time
                    self.wrist_history.clear()
                    return "SWIPE_LEFT", "NEXT_PAGE", cursor_pos, {"vx": vx}
                elif vx > 650:  # Rapid movement right
                    self.last_swipe_time = current_time
                    self.wrist_history.clear()
                    return "SWIPE_RIGHT", "PREV_PAGE", cursor_pos, {"vx": vx}

        # 2. PINCH GESTURE -> Click / Select
        if is_pinching:
            self.palm_start_time = None
            return "PINCH", "SELECT", cursor_pos, {"pinch_dist": pinch_dist}

        # 3. FIST GESTURE -> Back (All 4 fingers curled)
        if not is_index_ext and not is_middle_ext and not is_ring_ext and not is_pinky_ext:
            self.palm_start_time = None
            return "FIST", "BACK", cursor_pos, {}

        # 4. TWO-FINGER GESTURE -> Open Menu
        if is_index_ext and is_middle_ext and not is_ring_ext and not is_pinky_ext:
            self.palm_start_time = None
            return "TWO_FINGER", "OPEN_MENU", cursor_pos, {}

        # 5. POINT GESTURE -> Move Cursor
        if is_index_ext and not is_middle_ext and not is_ring_ext and not is_pinky_ext:
            self.palm_start_time = None
            return "POINT", "MOVE_CURSOR", cursor_pos, {}

        # 6. OPEN PALM & PALM HOLD -> Move/Select or Home
        if is_index_ext and is_middle_ext and is_ring_ext and is_pinky_ext:
            if self.palm_start_time is None:
                self.palm_start_time = current_time

            duration = current_time - self.palm_start_time
            if duration >= self.palm_hold_threshold:
                return "PALM_HOLD", "HOME_SCREEN", cursor_pos, {"held": duration}
            else:
                return "OPEN_PALM", "MOVE_MODE", cursor_pos, {"held": duration}

        self.palm_start_time = None
        return "GENERIC_HAND", "TRACKING", cursor_pos, {}
