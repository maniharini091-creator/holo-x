import { GestureType, HandLandmark } from '../types';

interface GestureResult {
  gesture: GestureType;
  action: string;
  cursor: { x: number; y: number };
  confidence: number;
  pinchDistance: number;
  isPinching: boolean;
  rawDetails?: string;
}

export class GestureClassifier {
  private positionHistory: Array<{ x: number; y: number; time: number }> = [];
  private palmStartTime: number | null = null;
  private lastSwipeTime: number = 0;
  private swipeCooldown: number = 600; // ms
  private holdThreshold: number = 1000; // ms for Palm Hold

  private dist(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private isExtended(landmarks: HandLandmark[], tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
    const tip = landmarks[tipIdx];
    const pip = landmarks[pipIdx];
    const wrist = landmarks[0];

    const distTipWrist = this.dist(tip, wrist);
    const distPipWrist = this.dist(pip, wrist);

    // Tip further from wrist than PIP joint indicates extended finger
    return distTipWrist > distPipWrist * 1.12;
  }

  public classify(landmarks: HandLandmark[]): GestureResult {
    const now = Date.now();

    if (!landmarks || landmarks.length < 21) {
      this.positionHistory = [];
      this.palmStartTime = null;
      return {
        gesture: 'NONE',
        action: 'SEARCHING HAND',
        cursor: { x: 0.5, y: 0.5 },
        confidence: 0,
        pinchDistance: 1,
        isPinching: false,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Track wrist position history for swipes
    this.positionHistory.push({ x: wrist.x, y: wrist.y, time: now });
    if (this.positionHistory.length > 10) {
      this.positionHistory.shift();
    }

    // Cursor follows index fingertip (mirrored X coordinate for natural interaction)
    const cursor = {
      x: 1 - indexTip.x, // Flip X so hand moving right moves cursor right
      y: indexTip.y,
    };

    // Calculate pinch distance between thumb tip and index tip
    const pinchDist = this.dist(thumbTip, indexTip);
    const handScale = Math.max(this.dist(landmarks[0], landmarks[9]), 0.1);
    const normalizedPinchDist = pinchDist / handScale;
    const isPinching = normalizedPinchDist < 0.28;

    // Finger extensions
    const indexExt = this.isExtended(landmarks, 8, 6, 5);
    const middleExt = this.isExtended(landmarks, 12, 10, 9);
    const ringExt = this.isExtended(landmarks, 16, 14, 13);
    const pinkyExt = this.isExtended(landmarks, 20, 18, 17);

    // 1. SWIPE DETECTION (rapid horizontal displacement)
    if (this.positionHistory.length >= 5 && now - this.lastSwipeTime > this.swipeCooldown) {
      const oldest = this.positionHistory[0];
      const newest = this.positionHistory[this.positionHistory.length - 1];
      const dt = newest.time - oldest.time;
      if (dt > 40 && dt < 400) {
        // Because camera is mirrored: moving hand right -> oldest.x > newest.x in raw mirrored space
        const dx = newest.x - oldest.x;
        const speed = dx / (dt / 1000); // units per sec

        // In webcam mirror: moving physical hand left makes X increase (or decrease depending on flip)
        // Let's ensure intuitive direction:
        if (speed > 1.2) {
          this.lastSwipeTime = now;
          this.positionHistory = [];
          return {
            gesture: 'SWIPE_LEFT',
            action: 'NEXT PAGE',
            cursor,
            confidence: 0.92,
            pinchDistance: normalizedPinchDist,
            isPinching: false,
            rawDetails: `Velocity: ${speed.toFixed(2)}`,
          };
        } else if (speed < -1.2) {
          this.lastSwipeTime = now;
          this.positionHistory = [];
          return {
            gesture: 'SWIPE_RIGHT',
            action: 'PREVIOUS PAGE',
            cursor,
            confidence: 0.92,
            pinchDistance: normalizedPinchDist,
            isPinching: false,
            rawDetails: `Velocity: ${speed.toFixed(2)}`,
          };
        }
      }
    }

    // 2. PINCH GESTURE -> Select / Click
    if (isPinching) {
      this.palmStartTime = null;
      return {
        gesture: 'PINCH',
        action: 'SELECT',
        cursor,
        confidence: Math.max(0.7, 1 - normalizedPinchDist),
        pinchDistance: normalizedPinchDist,
        isPinching: true,
        rawDetails: `Pinch dist: ${normalizedPinchDist.toFixed(2)}`,
      };
    }

    // 3. FIST GESTURE -> Back (All fingers curled)
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
      this.palmStartTime = null;
      return {
        gesture: 'FIST',
        action: 'BACK',
        cursor,
        confidence: 0.95,
        pinchDistance: normalizedPinchDist,
        isPinching: false,
        rawDetails: 'All fingers curled',
      };
    }

    // 4. TWO-FINGER GESTURE -> Open Menu
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      this.palmStartTime = null;
      return {
        gesture: 'TWO_FINGER',
        action: 'OPEN MENU',
        cursor,
        confidence: 0.94,
        pinchDistance: normalizedPinchDist,
        isPinching: false,
        rawDetails: 'Index + Middle extended',
      };
    }

    // 5. POINT GESTURE -> Move Cursor
    if (indexExt && !middleExt && !ringExt && !pinkyExt) {
      this.palmStartTime = null;
      return {
        gesture: 'POINT',
        action: 'MOVE CURSOR',
        cursor,
        confidence: 0.9,
        pinchDistance: normalizedPinchDist,
        isPinching: false,
        rawDetails: 'Index pointed',
      };
    }

    // 6. OPEN PALM & PALM HOLD GESTURE -> Move/Select Mode or Home
    if (indexExt && middleExt && ringExt && pinkyExt) {
      if (this.palmStartTime === null) {
        this.palmStartTime = now;
      }
      const heldTime = now - this.palmStartTime;
      if (heldTime > this.holdThreshold) {
        return {
          gesture: 'PALM_HOLD',
          action: 'HOME SCREEN',
          cursor,
          confidence: 0.96,
          pinchDistance: normalizedPinchDist,
          isPinching: false,
          rawDetails: `Hold: ${(heldTime / 1000).toFixed(1)}s`,
        };
      }
      return {
        gesture: 'OPEN_PALM',
        action: 'MOVE / SELECT MODE',
        cursor,
        confidence: 0.88,
        pinchDistance: normalizedPinchDist,
        isPinching: false,
        rawDetails: `Holding ${(heldTime / 1000).toFixed(1)}s...`,
      };
    }

    this.palmStartTime = null;
    return {
      gesture: 'OPEN_PALM',
      action: 'MOVE / SELECT MODE',
      cursor,
      confidence: 0.75,
      pinchDistance: normalizedPinchDist,
      isPinching: false,
    };
  }
}
