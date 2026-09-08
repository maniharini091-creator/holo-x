# HoloX – Touchless Holographic Smartphone Interface Prototype

A fully functional touchless holographic smartphone interface powered by a laptop webcam (hand tracking via MediaPipe) and laptop microphone (voice commands via SpeechRecognition).

## Project Architecture

The application is structured into clean, modular Python files:

1. `hand_tracking.py`: OpenCV webcam capture, MediaPipe Hand detector, 21 skeletal landmark extraction.
2. `gesture_recognition.py`: Geometric & kinematic classification of 8 core hand gestures.
3. `voice_recognition.py`: Asynchronous microphone listener with command parsing.
4. `command_controller.py`: Central hub mapping gestures and speech to smartphone navigation.
5. `holo_ui.py`: Futuristic Pygame holographic mobile interface with transparent glass panels, glowing neon UI, apps, and PIP camera view.
6. `main.py`: Unified loop synchronizing webcam, microphone, hand tracking, and holographic display.

## Installation & Setup

Ensure Python 3.9+ is installed on your laptop:

```bash
# 1. Clone or navigate to the project directory
cd python_holox

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch HoloX
python main.py
```

## Hand Gestures

| Gesture | Action | Description |
| :--- | :--- | :--- |
| **Open Palm** | Move / Select Mode | All fingers extended |
| **Point (Index)** | Move Cursor | Index extended, others curled |
| **Pinch** | Click / Select | Thumb tip touches index tip |
| **Swipe Left** | Next Page / Tab | Rapid horizontal hand motion to the left |
| **Swipe Right** | Previous Page | Rapid horizontal hand motion to the right |
| **Fist** | Back | All fingers closed into a fist |
| **Two Fingers** | Open Menu | Index & Middle fingers extended |
| **Palm + Hold** | Home Screen | Open palm held steady for > 1.2s |

## Voice Commands

Speak clearly into your laptop's microphone:

* *"Open phone"*
* *"Open messages"*
* *"Open calculator"*
* *"Open camera"*
* *"Open gallery"*
* *"Open music"*
* *"Go home"*
* *"Go back"*
* *"Open settings"*
* *"Show contacts"*
