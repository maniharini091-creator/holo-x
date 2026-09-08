"""
HoloX - Touchless Holographic Smartphone Interface
Module 5: Mobile Interface (holo_ui.py)

Implements:
- Futuristic holographic smartphone interface rendered with Pygame
- Dark neon cyberpunk aesthetic with transparent glass panels
- Circular glowing app icons (Home, Phone, Contacts, Messages, Camera, Gallery, Music, Calculator, Calendar, Settings)
- Back and Home touchless navigation buttons
- Embedded webcam/hand tracking preview PIP
- Real-time gesture and voice feedback HUD
- Virtual holographic cursor with pinch click feedback
"""

import sys
import time
import pygame
import cv2
import numpy as np


class HoloSmartphoneUI:
    def __init__(self, width=1280, height=720):
        pygame.init()
        pygame.font.init()
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("HoloX – Touchless Holographic Smartphone Prototype")
        self.clock = pygame.time.Clock()

        # Neon Cyberpunk Color Palette
        self.CLR_BG = (8, 12, 22)
        self.CLR_CYAN = (0, 240, 255)
        self.CLR_CYAN_DIM = (0, 150, 180)
        self.CLR_MAGENTA = (255, 0, 128)
        self.CLR_AMBER = (255, 170, 0)
        self.CLR_GREEN = (0, 255, 136)
        self.CLR_PANEL = (15, 23, 42)
        self.CLR_WHITE = (240, 245, 255)
        self.CLR_MUTED = (100, 116, 139)

        # Fonts
        self.font_title = pygame.font.SysPygameFont = pygame.font.Font(None, 34)
        self.font_body = pygame.font.Font(None, 24)
        self.font_small = pygame.font.Font(None, 18)
        self.font_large = pygame.font.Font(None, 48)

        # Phone Frame Geometry (Center Stage)
        self.phone_w = 380
        self.phone_h = 660
        self.phone_x = (self.width - self.phone_w) // 2
        self.phone_y = (self.height - self.phone_h) // 2

        # Virtual cursor
        self.cursor_x = self.phone_x + self.phone_w // 2
        self.cursor_y = self.phone_y + self.phone_h // 2
        self.cursor_click_fx = 0

        # Current screen state
        self.current_screen = "home"
        self.command_controller = None

        # HUD feedback
        self.hud_source = "SYSTEM"
        self.hud_title = "HOLOX INITIALIZED"
        self.hud_action = "AWAITING GESTURES / VOICE"
        self.hud_timestamp = time.time()

        # Status meters
        self.hand_status = "ACTIVE"
        self.voice_status = "READY"
        self.sys_status = "ONLINE"

        # Interactive apps definitions
        self.apps = [
            {"id": "phone", "name": "Phone", "color": (34, 197, 94), "icon": "📞"},
            {"id": "messages", "name": "Messages", "color": (59, 130, 246), "icon": "💬"},
            {"id": "calculator", "name": "Calculator", "color": (245, 158, 11), "icon": "🧮"},
            {"id": "camera", "name": "Camera", "color": (168, 85, 247), "icon": "📷"},
            {"id": "gallery", "name": "Gallery", "color": (236, 72, 153), "icon": "🖼️"},
            {"id": "music", "name": "Music", "color": (239, 68, 68), "icon": "🎵"},
            {"id": "contacts", "name": "Contacts", "color": (20, 184, 166), "icon": "👥"},
            {"id": "calendar", "name": "Calendar", "color": (99, 102, 241), "icon": "📅"},
            {"id": "settings", "name": "Settings", "color": (107, 114, 128), "icon": "⚙️"},
        ]

        # Calculator local state
        self.calc_display = "0"
        # Music state
        self.music_playing = True
        self.music_track = "Cybernetic Dreams (HoloMix)"

        # Camera preview frame surface cache
        self.cam_surface = None

    def set_command_controller(self, controller):
        self.command_controller = controller

    def update_virtual_cursor(self, cam_x, cam_y, cam_w=640, cam_h=480):
        """Maps camera coordinates (640x480) into screen coordinates"""
        norm_x = cam_x / cam_w
        norm_y = cam_y / cam_h
        # Map to screen space with slight center focus on phone
        self.cursor_x = int(norm_x * self.width)
        self.cursor_y = int(norm_y * self.height)

    def simulate_click(self, cam_x, cam_y):
        self.cursor_click_fx = 15  # frame countdown for ripple
        # Check if click lands on back or home button
        bx = self.phone_x + 60
        hx = self.phone_x + self.phone_w - 100
        btn_y = self.phone_y + self.phone_h - 45
        if abs(self.cursor_y - btn_y) < 25:
            if abs(self.cursor_x - bx) < 40:
                if self.command_controller:
                    self.command_controller.go_back()
                return
            if abs(self.cursor_x - hx) < 40:
                if self.command_controller:
                    self.command_controller.navigate_to("home")
                return

        # Check app icons on home screen
        if self.current_screen == "home":
            grid_start_x = self.phone_x + 35
            grid_start_y = self.phone_y + 190
            cols = 3
            spacing_x = 110
            spacing_y = 110
            for i, app in enumerate(self.apps):
                col = i % cols
                row = i // cols
                app_x = grid_start_x + col * spacing_x + 35
                app_y = grid_start_y + row * spacing_y + 35
                dist = ((self.cursor_x - app_x)**2 + (self.cursor_y - app_y)**2)**0.5
                if dist < 40:
                    if self.command_controller:
                        self.command_controller.navigate_to(app["id"])
                    return

    def next_tab_or_item(self):
        if self.current_screen == "music":
            self.music_track = "Neon Orbit (Synth Remix)"
        elif self.current_screen == "gallery":
            self.calc_display = "IMG_02"

    def prev_tab_or_item(self):
        if self.current_screen == "music":
            self.music_track = "Starlight Matrix (Ambient)"

    def switch_screen(self, screen_name):
        self.current_screen = screen_name

    def update_hud_status(self, source, title, action):
        self.hud_source = source
        self.hud_title = title
        self.hud_action = action
        self.hud_timestamp = time.time()

    def update_cam_preview(self, cv_frame):
        """Converts OpenCV BGR image into Pygame surface for PIP preview"""
        if cv_frame is not None:
            # Resize to PIP dimensions (220x165)
            pip_frame = cv2.resize(cv_frame, (220, 165))
            # Convert BGR to RGB
            pip_rgb = cv2.cvtColor(pip_frame, cv2.COLOR_BGR2RGB)
            # Transpose for Pygame surface
            pip_rgb = np.rot90(pip_rgb)
            pip_rgb = pygame.surfarray.make_surface(pip_rgb)
            self.cam_surface = pygame.transform.flip(pip_rgb, True, False)

    def draw_hologram_phone(self):
        # 1. Phone Body Glass Container
        phone_rect = pygame.Rect(self.phone_x, self.phone_y, self.phone_w, self.phone_h)
        glass_surf = pygame.Surface((self.phone_w, self.phone_h), pygame.SRCALPHA)
        glass_surf.fill((10, 20, 35, 210))  # Semi-transparent glass
        self.screen.blit(glass_surf, (self.phone_x, self.phone_y))

        # Glowing Neon Hologram Border
        pygame.draw.rect(self.screen, self.CLR_CYAN, phone_rect, 2, border_radius=28)
        pygame.draw.rect(self.screen, (0, 100, 140), phone_rect.inflate(4, 4), 1, border_radius=30)

        # Phone Header / Status Bar
        t_str = time.strftime("%H:%M")
        txt_time = self.font_small.render(f"HOLONET 6G   •   {t_str}", True, self.CLR_CYAN)
        txt_bat = self.font_small.render("100% ⚡", True, self.CLR_GREEN)
        self.screen.blit(txt_time, (self.phone_x + 20, self.phone_y + 16))
        self.screen.blit(txt_bat, (self.phone_x + self.phone_w - 75, self.phone_y + 16))

        # Screen content router
        content_rect = pygame.Rect(self.phone_x + 15, self.phone_y + 50, self.phone_w - 30, self.phone_h - 110)
        if self.current_screen == "home":
            self._render_home_screen()
        elif self.current_screen == "phone":
            self._render_phone_screen()
        elif self.current_screen == "messages":
            self._render_messages_screen()
        elif self.current_screen == "calculator":
            self._render_calculator_screen()
        elif self.current_screen == "camera":
            self._render_camera_screen()
        elif self.current_screen == "gallery":
            self._render_gallery_screen()
        elif self.current_screen == "music":
            self._render_music_screen()
        elif self.current_screen == "contacts":
            self._render_contacts_screen()
        elif self.current_screen == "calendar":
            self._render_calendar_screen()
        elif self.current_screen == "settings":
            self._render_settings_screen()

        # Bottom Holographic Navigation Bar
        nav_y = self.phone_y + self.phone_h - 45
        # Back Button
        pygame.draw.circle(self.screen, (30, 41, 59), (self.phone_x + 70, nav_y), 18)
        pygame.draw.circle(self.screen, self.CLR_CYAN, (self.phone_x + 70, nav_y), 18, 1)
        txt_back = self.font_small.render("◀ BACK", True, self.CLR_CYAN)
        self.screen.blit(txt_back, (self.phone_x + 50, nav_y - 7))

        # Home Button
        pygame.draw.circle(self.screen, (30, 41, 59), (self.phone_x + self.phone_w - 70, nav_y), 18)
        pygame.draw.circle(self.screen, self.CLR_CYAN, (self.phone_x + self.phone_w - 70, nav_y), 18, 1)
        txt_home = self.font_small.render("HOME ⌂", True, self.CLR_CYAN)
        self.screen.blit(txt_home, (self.phone_x + self.phone_w - 95, nav_y - 7))

    def _render_home_screen(self):
        # Holographic Clock Widget
        t_big = time.strftime("%H:%M")
        d_str = time.strftime("%A, %b %d")
        txt_t = self.font_large.render(t_big, True, self.CLR_WHITE)
        txt_d = self.font_small.render(f"HOLOGRAPHIC OS  |  {d_str}", True, self.CLR_CYAN)
        self.screen.blit(txt_t, (self.phone_x + (self.phone_w - txt_t.get_width()) // 2, self.phone_y + 65))
        self.screen.blit(txt_d, (self.phone_x + (self.phone_w - txt_d.get_width()) // 2, self.phone_y + 120))

        # App Grid (3x3)
        grid_start_x = self.phone_x + 35
        grid_start_y = self.phone_y + 175
        cols = 3
        spacing_x = 110
        spacing_y = 110

        for i, app in enumerate(self.apps):
            col = i % cols
            row = i // cols
            ax = grid_start_x + col * spacing_x + 35
            ay = grid_start_y + row * spacing_y + 35

            # Circular Glowing App Icon
            pygame.draw.circle(self.screen, (20, 30, 50), (ax, ay), 32)
            pygame.draw.circle(self.screen, self.CLR_CYAN, (ax, ay), 32, 2)

            # Icon text / label
            lbl = self.font_small.render(app["name"], True, self.CLR_WHITE)
            self.screen.blit(lbl, (ax - lbl.get_width() // 2, ay + 38))

            # Inner symbol
            sym = self.font_body.render(app["name"][0], True, self.CLR_CYAN)
            self.screen.blit(sym, (ax - sym.get_width() // 2, ay - sym.get_height() // 2))

    def _render_phone_screen(self):
        txt_title = self.font_title.render("Phone", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        # Simulated dialer
        dial_rect = pygame.Rect(self.phone_x + 30, self.phone_y + 120, self.phone_w - 60, 40)
        pygame.draw.rect(self.screen, (15, 25, 45), dial_rect, border_radius=10)
        pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, dial_rect, 1, border_radius=10)
        num_txt = self.font_body.render("+1 (800) HOLO-AI", True, self.CLR_WHITE)
        self.screen.blit(num_txt, (self.phone_x + 45, self.phone_y + 130))

        # Keypad 3x4
        keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]
        for idx, k in enumerate(keys):
            kx = self.phone_x + 50 + (idx % 3) * 100
            ky = self.phone_y + 190 + (idx // 3) * 70
            pygame.draw.circle(self.screen, (20, 35, 55), (kx + 30, ky + 25), 25)
            pygame.draw.circle(self.screen, self.CLR_CYAN_DIM, (kx + 30, ky + 25), 25, 1)
            kt = self.font_body.render(k, True, self.CLR_CYAN)
            self.screen.blit(kt, (kx + 30 - kt.get_width() // 2, ky + 25 - kt.get_height() // 2))

        # Call button
        call_btn = pygame.Rect(self.phone_x + self.phone_w // 2 - 40, self.phone_y + 500, 80, 50)
        pygame.draw.rect(self.screen, (34, 197, 94), call_btn, border_radius=25)
        call_txt = self.font_body.render("CALL", True, (0, 0, 0))
        self.screen.blit(call_txt, (call_btn.centerx - call_txt.get_width() // 2, call_btn.centery - call_txt.get_height() // 2))

    def _render_messages_screen(self):
        txt_title = self.font_title.render("Encrypted Comms", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        # Message bubbles
        msgs = [
            ("Nexus AI", "HoloX Quantum Uplink established.", True),
            ("Operator", "Testing hand gesture navigation.", False),
            ("Nexus AI", "Voice recognition synchronized at 99.4%.", True),
            ("System", "Gesture: PINCH detected -> select.", True)
        ]
        curr_y = self.phone_y + 130
        for sender, msg, is_ai in msgs:
            bx = self.phone_x + (25 if is_ai else 80)
            bw = self.phone_w - 110
            bubble = pygame.Rect(bx, curr_y, bw, 60)
            color = (15, 35, 60) if is_ai else (0, 100, 130)
            pygame.draw.rect(self.screen, color, bubble, border_radius=12)
            pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, bubble, 1, border_radius=12)

            s_txt = self.font_small.render(sender, True, self.CLR_CYAN if is_ai else self.CLR_WHITE)
            m_txt = self.font_small.render(msg, True, self.CLR_WHITE)
            self.screen.blit(s_txt, (bx + 12, curr_y + 8))
            self.screen.blit(m_txt, (bx + 12, curr_y + 30))
            curr_y += 75

    def _render_calculator_screen(self):
        txt_title = self.font_title.render("Quantum Calc", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))

        # Display screen
        disp_rect = pygame.Rect(self.phone_x + 30, self.phone_y + 120, self.phone_w - 60, 60)
        pygame.draw.rect(self.screen, (10, 20, 35), disp_rect, border_radius=10)
        pygame.draw.rect(self.screen, self.CLR_CYAN, disp_rect, 1, border_radius=10)
        d_val = self.font_large.render("3.14159", True, self.CLR_CYAN)
        self.screen.blit(d_val, (disp_rect.right - d_val.get_width() - 15, disp_rect.centery - d_val.get_height() // 2))

        # Keypad
        calc_btns = [
            ["C", "( )", "%", "÷"],
            ["7", "8", "9", "×"],
            ["4", "5", "6", "-"],
            ["1", "2", "3", "+"],
            ["0", ".", "DEL", "="]
        ]
        for row_i, row in enumerate(calc_btns):
            for col_i, btn in enumerate(row):
                bx = self.phone_x + 35 + col_i * 78
                by = self.phone_y + 200 + row_i * 65
                brect = pygame.Rect(bx, by, 65, 50)
                is_eq = btn == "="
                clr = (0, 180, 200) if is_eq else (20, 35, 55)
                pygame.draw.rect(self.screen, clr, brect, border_radius=12)
                pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, brect, 1, border_radius=12)
                btxt = self.font_body.render(btn, True, (0, 0, 0) if is_eq else self.CLR_WHITE)
                self.screen.blit(btxt, (brect.centerx - btxt.get_width() // 2, brect.centery - btxt.get_height() // 2))

    def _render_camera_screen(self):
        txt_title = self.font_title.render("Hologram Scanner", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        # Viewfinder
        vf = pygame.Rect(self.phone_x + 30, self.phone_y + 120, self.phone_w - 60, 360)
        pygame.draw.rect(self.screen, (5, 15, 25), vf, border_radius=16)
        pygame.draw.rect(self.screen, self.CLR_CYAN, vf, 2, border_radius=16)

        # Crosshairs / AR Reticle
        cx, cy = vf.centerx, vf.centery
        pygame.draw.circle(self.screen, self.CLR_CYAN, (cx, cy), 45, 1)
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx - 60, cy), (cx + 60, cy), 1)
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx, cy - 60), (cx, cy + 60), 1)

        ar_txt = self.font_small.render("AR DEPTH SCAN: 1.28m  |  FACE: LOCKED", True, self.CLR_GREEN)
        self.screen.blit(ar_txt, (vf.left + 15, vf.bottom - 30))

        # Shutter button
        shutter = pygame.Rect(self.phone_x + self.phone_w // 2 - 30, self.phone_y + 510, 60, 60)
        pygame.draw.circle(self.screen, self.CLR_CYAN, (shutter.centerx, shutter.centery), 30)
        pygame.draw.circle(self.screen, self.CLR_WHITE, (shutter.centerx, shutter.centery), 24)

    def _render_gallery_screen(self):
        txt_title = self.font_title.render("Holo Gallery", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        # Photos grid
        for i in range(4):
            gx = self.phone_x + 35 + (i % 2) * 160
            gy = self.phone_y + 130 + (i // 2) * 160
            g_rect = pygame.Rect(gx, gy, 140, 140)
            pygame.draw.rect(self.screen, (20, 40, 65), g_rect, border_radius=12)
            pygame.draw.rect(self.screen, self.CLR_CYAN, g_rect, 1, border_radius=12)
            lbl = self.font_small.render(f"HOLO_SCAN_{i+1:02d}", True, self.CLR_WHITE)
            self.screen.blit(lbl, (gx + 12, gy + 115))

    def _render_music_screen(self):
        txt_title = self.font_title.render("HoloX Sonic", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))

        # Vinyl / Disc Hologram
        cx = self.phone_x + self.phone_w // 2
        cy = self.phone_y + 240
        pygame.draw.circle(self.screen, (15, 30, 50), (cx, cy), 90)
        pygame.draw.circle(self.screen, self.CLR_MAGENTA, (cx, cy), 90, 2)
        pygame.draw.circle(self.screen, self.CLR_CYAN, (cx, cy), 45, 2)
        pygame.draw.circle(self.screen, self.CLR_WHITE, (cx, cy), 15)

        # Track name
        tr_txt = self.font_body.render(self.music_track, True, self.CLR_WHITE)
        self.screen.blit(tr_txt, (cx - tr_txt.get_width() // 2, cy + 115))

        # Visualizer bars
        bars = [20, 35, 50, 65, 80, 55, 70, 40, 60, 85, 45, 30]
        for b_i, b_h in enumerate(bars):
            bx = self.phone_x + 50 + b_i * 24
            by = self.phone_y + 440 - b_h // 2
            pygame.draw.rect(self.screen, self.CLR_CYAN, (bx, by, 16, b_h), border_radius=4)

    def _render_contacts_screen(self):
        txt_title = self.font_title.render("Contacts", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        contacts = ["Aria Vance (Lead Eng)", "Dr. Kaelen (Cybernetics)", "Quantum Core Dispatch", "Samantha Reed"]
        for idx, c in enumerate(contacts):
            cy = self.phone_y + 130 + idx * 80
            crect = pygame.Rect(self.phone_x + 30, cy, self.phone_w - 60, 65)
            pygame.draw.rect(self.screen, (15, 28, 48), crect, border_radius=12)
            pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, crect, 1, border_radius=12)
            pygame.draw.circle(self.screen, self.CLR_CYAN, (self.phone_x + 65, cy + 32), 20)
            ctxt = self.font_small.render(c, True, self.CLR_WHITE)
            self.screen.blit(ctxt, (self.phone_x + 100, cy + 24))

    def _render_calendar_screen(self):
        txt_title = self.font_title.render("Quantum Agenda", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        events = [
            ("09:00 AM", "HoloX System Calibration"),
            ("11:30 AM", "MediaPipe Gesture Evaluation"),
            ("02:00 PM", "Whisper AI Voice Synch"),
            ("05:00 PM", "Holographic Phone Demo")
        ]
        for idx, (tm, ev) in enumerate(events):
            ey = self.phone_y + 140 + idx * 85
            erect = pygame.Rect(self.phone_x + 30, ey, self.phone_w - 60, 70)
            pygame.draw.rect(self.screen, (15, 30, 50), erect, border_radius=12)
            pygame.draw.rect(self.screen, self.CLR_CYAN, erect, 1, border_radius=12)
            t_r = self.font_small.render(tm, True, self.CLR_GREEN)
            e_r = self.font_small.render(ev, True, self.CLR_WHITE)
            self.screen.blit(t_r, (self.phone_x + 45, ey + 15))
            self.screen.blit(e_r, (self.phone_x + 45, ey + 38))

    def _render_settings_screen(self):
        txt_title = self.font_title.render("Settings", True, self.CLR_CYAN)
        self.screen.blit(txt_title, (self.phone_x + 30, self.phone_y + 70))
        opts = [
            ("Hand Tracking Sensitivity", "92% HIGH"),
            ("Voice Trigger Mode", "ALWAYS LISTENING"),
            ("Hologram Color Theme", "CYAN MATRIX"),
            ("Haptic Virtual Audio", "ENABLED"),
            ("Camera PIP Mirror", "ON (TOP RIGHT)")
        ]
        for idx, (label, val) in enumerate(opts):
            oy = self.phone_y + 130 + idx * 75
            orect = pygame.Rect(self.phone_x + 30, oy, self.phone_w - 60, 60)
            pygame.draw.rect(self.screen, (15, 28, 48), orect, border_radius=12)
            pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, orect, 1, border_radius=12)
            l_txt = self.font_small.render(label, True, self.CLR_WHITE)
            v_txt = self.font_small.render(val, True, self.CLR_CYAN)
            self.screen.blit(l_txt, (self.phone_x + 45, oy + 12))
            self.screen.blit(v_txt, (self.phone_x + 45, oy + 34))

    def draw_hud(self):
        # 1. Top HUD Banner
        hud_w = 680
        hud_h = 60
        hud_x = (self.width - hud_w) // 2
        hud_rect = pygame.Rect(hud_x, 15, hud_w, hud_h)

        pygame.draw.rect(self.screen, (10, 20, 35), hud_rect, border_radius=14)
        pygame.draw.rect(self.screen, self.CLR_CYAN, hud_rect, 1, border_radius=14)

        t1 = self.font_body.render(f"[{self.hud_source}] {self.hud_title}", True, self.CLR_CYAN)
        t2 = self.font_small.render(f"{self.hud_action}", True, self.CLR_WHITE)
        self.screen.blit(t1, (hud_x + 25, 24))
        self.screen.blit(t2, (hud_x + 25, 46))

        # 2. Left Side: Gestures & Voice Guide Panel
        guide_rect = pygame.Rect(30, 90, 260, 540)
        pygame.draw.rect(self.screen, (10, 18, 30), guide_rect, border_radius=16)
        pygame.draw.rect(self.screen, self.CLR_CYAN_DIM, guide_rect, 1, border_radius=16)

        g_title = self.font_body.render("GESTURE COMMANDS", True, self.CLR_CYAN)
        self.screen.blit(g_title, (45, 105))

        gestures_guide = [
            ("1. Open Palm", "Move / Select Mode"),
            ("2. Point (Index)", "Move Cursor"),
            ("3. Pinch", "Click / Select"),
            ("4. Swipe Left", "Next Page"),
            ("5. Swipe Right", "Previous Page"),
            ("6. Fist", "Back"),
            ("7. Two Fingers", "Open Menu"),
            ("8. Palm + Hold", "Home Screen"),
        ]
        gy = 140
        for name, act in gestures_guide:
            t_n = self.font_small.render(name, True, self.CLR_WHITE)
            t_a = self.font_small.render(f"→ {act}", True, self.CLR_CYAN)
            self.screen.blit(t_n, (45, gy))
            self.screen.blit(t_a, (45, gy + 16))
            gy += 42

        # Voice guide heading
        v_title = self.font_body.render("VOICE COMMANDS", True, self.CLR_CYAN)
        self.screen.blit(v_title, (45, gy + 10))
        voice_guide = [
            '"Open Phone"', '"Open Messages"',
            '"Open Calculator"', '"Open Camera"',
            '"Open Gallery"', '"Open Music"',
            '"Go Home"', '"Go Back"'
        ]
        gy += 40
        for v in voice_guide[:5]:
            t_v = self.font_small.render(f"• {v}", True, self.CLR_MUTED)
            self.screen.blit(t_v, (45, gy))
            gy += 20

        # 3. Right Side: Camera / Hand Tracking Preview Panel
        pip_w = 260
        pip_h = 320
        pip_x = self.width - pip_w - 30
        pip_y = 90
        pip_rect = pygame.Rect(pip_x, pip_y, pip_w, pip_h)
        pygame.draw.rect(self.screen, (10, 18, 30), pip_rect, border_radius=16)
        pygame.draw.rect(self.screen, self.CLR_CYAN, pip_rect, 1, border_radius=16)

        pip_title = self.font_body.render("HAND TRACKING PIP", True, self.CLR_CYAN)
        self.screen.blit(pip_title, (pip_x + 18, pip_y + 14))

        # Render OpenCV PIP surface if available
        if self.cam_surface is not None:
            self.screen.blit(self.cam_surface, (pip_x + 20, pip_y + 45))
        else:
            cam_box = pygame.Rect(pip_x + 20, pip_y + 45, 220, 165)
            pygame.draw.rect(self.screen, (15, 25, 40), cam_box)
            no_cam = self.font_small.render("Webcam stream active", True, self.CLR_MUTED)
            self.screen.blit(no_cam, (cam_box.centerx - no_cam.get_width() // 2, cam_box.centery))

        # System Metrics Display
        status_y = pip_y + 225
        t_hand = self.font_small.render(f"Hand Tracking: {self.hand_status}", True, self.CLR_GREEN)
        t_voice = self.font_small.render(f"Voice Recognition: {self.voice_status}", True, self.CLR_CYAN)
        t_sys = self.font_small.render(f"System Status: {self.sys_status}", True, self.CLR_WHITE)

        self.screen.blit(t_hand, (pip_x + 20, status_y))
        self.screen.blit(t_voice, (pip_x + 20, status_y + 24))
        self.screen.blit(t_sys, (pip_x + 20, status_y + 48))

        # 4. Virtual Holographic Cursor
        self.draw_virtual_cursor()

    def draw_virtual_cursor(self):
        cx, cy = self.cursor_x, self.cursor_y
        # Glowing reticle
        pygame.draw.circle(self.screen, self.CLR_CYAN, (cx, cy), 12, 2)
        pygame.draw.circle(self.screen, self.CLR_WHITE, (cx, cy), 4)

        # Crosshairs
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx - 18, cy), (cx - 8, cy), 2)
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx + 8, cy), (cx + 18, cy), 2)
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx, cy - 18), (cx, cy - 8), 2)
        pygame.draw.line(self.screen, self.CLR_CYAN, (cx, cy + 8), (cx, cy + 18), 2)

        # Click Ripple Animation
        if self.cursor_click_fx > 0:
            radius = 15 + (15 - self.cursor_click_fx) * 3
            pygame.draw.circle(self.screen, self.CLR_MAGENTA, (cx, cy), radius, 2)
            self.cursor_click_fx -= 1

    def render(self):
        # Background cyberpunk scanline grid
        self.screen.fill(self.CLR_BG)

        # Draw smartphone
        self.draw_hologram_phone()

        # Draw HUD overlays
        self.draw_hud()

        pygame.display.flip()
        self.clock.tick(60)
