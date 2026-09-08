"""
HoloX - Touchless Holographic Smartphone Interface
Module 4: Command Controller (command_controller.py)

Acts as the central nervous system connecting:
- Hand tracking / Gestures
- Voice commands
- Smartphone state and UI navigation stack
"""

import time


class CommandController:
    def __init__(self, ui):
        self.ui = ui
        self.current_screen = "home"
        self.screen_history = []
        
        # Debounce tracking
        self.last_action_time = 0
        self.action_cooldown = 0.4
        
        # Feedback banner state
        self.latest_event = {
            "source": "SYSTEM",
            "title": "SYSTEM ONLINE",
            "action": "READY FOR GESTURE OR VOICE",
            "timestamp": time.time()
        }

    def set_feedback(self, source, title, action):
        self.latest_event = {
            "source": source,
            "title": title,
            "action": action,
            "timestamp": time.time()
        }
        if hasattr(self.ui, "update_hud_status"):
            self.ui.update_hud_status(source, title, action)

    def handle_gesture(self, gesture, action, cursor_pos, extra):
        now = time.time()

        # Update cursor on UI
        if cursor_pos:
            self.ui.update_virtual_cursor(cursor_pos[0], cursor_pos[1])

        # 1. PINCH -> Click on UI at cursor position
        if gesture == "PINCH":
            if now - self.last_action_time > self.action_cooldown:
                self.last_action_time = now
                self.set_feedback("GESTURE", "PINCH", "SELECT")
                if cursor_pos:
                    self.ui.simulate_click(cursor_pos[0], cursor_pos[1])

        # 2. FIST -> Back
        elif gesture == "FIST":
            if now - self.last_action_time > 0.8:
                self.last_action_time = now
                self.set_feedback("GESTURE", "FIST", "GO BACK")
                self.go_back()

        # 3. PALM_HOLD -> Home Screen
        elif gesture == "PALM_HOLD":
            if now - self.last_action_time > 0.8:
                self.last_action_time = now
                self.set_feedback("GESTURE", "OPEN PALM (HELD)", "HOME SCREEN")
                self.navigate_to("home")

        # 4. SWIPE_LEFT -> Next Page / Tab
        elif gesture == "SWIPE_LEFT":
            if now - self.last_action_time > 0.6:
                self.last_action_time = now
                self.set_feedback("GESTURE", "SWIPE LEFT", "NEXT PAGE")
                self.ui.next_tab_or_item()

        # 5. SWIPE_RIGHT -> Previous Page / Tab
        elif gesture == "SWIPE_RIGHT":
            if now - self.last_action_time > 0.6:
                self.last_action_time = now
                self.set_feedback("GESTURE", "SWIPE RIGHT", "PREV PAGE")
                self.ui.prev_tab_or_item()

        # 6. TWO_FINGER -> Open Menu
        elif gesture == "TWO_FINGER":
            if now - self.last_action_time > 0.6:
                self.last_action_time = now
                self.set_feedback("GESTURE", "TWO FINGERS", "OPEN MENU")
                self.navigate_to("home")

        # 7. POINT -> Cursor Move
        elif gesture == "POINT":
            self.set_feedback("GESTURE", "POINTING", "MOVE CURSOR")

        # 8. OPEN_PALM -> Move mode
        elif gesture == "OPEN_PALM":
            self.set_feedback("GESTURE", "OPEN PALM", "SELECT MODE")

    def handle_voice_command(self, raw_transcript, cmd_name, action_type, target):
        self.set_feedback("VOICE", f"Command: {cmd_name}", f"Action: {action_type} {target or ''}")

        if action_type == "OPEN_APP" and target:
            self.navigate_to(target)
        elif action_type == "NAVIGATE":
            if target == "home":
                self.navigate_to("home")
            elif target == "back":
                self.go_back()

    def navigate_to(self, screen_name):
        if screen_name == self.current_screen:
            return
        if self.current_screen != "home":
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
            self.ui.switch_screen("home")
