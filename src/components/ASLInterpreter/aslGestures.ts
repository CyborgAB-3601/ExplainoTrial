/**
 * ASL (American Sign Language) Hand Joint & Pose Configurations
 * Defines finger joint angles, wrist rotations, and 3D positions
 * for mathematical signing gestures and fingerspelling.
 */

export interface FingerJoints {
  base: number; // 0 = straight, 1.5 = fully curled (~90 deg)
  mid: number;
  tip: number;
  spread?: number; // lateral abduction
}

export interface HandPose {
  wristPos: [number, number, number]; // [x, y, z]
  wristRot: [number, number, number]; // [rotX, rotY, rotZ] in radians
  thumb: FingerJoints;
  index: FingerJoints;
  middle: FingerJoints;
  ring: FingerJoints;
  pinky: FingerJoints;
}

export interface DualHandPose {
  left: HandPose;
  right: HandPose;
  gestureName: string;
  description: string;
}

// ── 1. The Signature "Isolate / F / 9 / Pinch" Pose (From user's screenshot) ──
// Thumb and index form an 'O' ring, while middle, ring, pinky extend upwards
export const POSE_ISOLATE_OK: DualHandPose = {
  gestureName: 'isolate',
  description: 'Isolate / Pinch sign (Thumb + Index ring, three fingers extended)',
  left: {
    wristPos: [-0.95, -0.1, 0.1],
    wristRot: [0.15, 0.35, -0.2],
    thumb: { base: 0.65, mid: 0.5, tip: 0.45, spread: 0.3 },
    index: { base: 0.95, mid: 0.85, tip: 0.65, spread: -0.1 },
    middle: { base: 0.15, mid: 0.1, tip: 0.05, spread: 0.1 },
    ring: { base: 0.2, mid: 0.15, tip: 0.1, spread: 0.2 },
    pinky: { base: 0.25, mid: 0.2, tip: 0.15, spread: 0.35 },
  },
  right: {
    wristPos: [0.95, -0.1, 0.1],
    wristRot: [0.15, -0.35, 0.2],
    thumb: { base: 0.65, mid: 0.5, tip: 0.45, spread: -0.3 },
    index: { base: 0.95, mid: 0.85, tip: 0.65, spread: 0.1 },
    middle: { base: 0.15, mid: 0.1, tip: 0.05, spread: -0.1 },
    ring: { base: 0.2, mid: 0.15, tip: 0.1, spread: -0.2 },
    pinky: { base: 0.25, mid: 0.2, tip: 0.15, spread: -0.35 },
  },
};

// ── 2. Subtract / Minus Pose ──
// Right hand curved claw pulling away, Left hand base reference
export const POSE_SUBTRACT: DualHandPose = {
  gestureName: 'subtract',
  description: 'Subtract / Take away sign (Hand pulling back from flat palm)',
  left: {
    wristPos: [-0.8, -0.3, 0],
    wristRot: [0.4, 0.2, -0.1],
    thumb: { base: 0.2, mid: 0.1, tip: 0.1, spread: 0.2 },
    index: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0 },
    middle: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0 },
    pinky: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0 },
  },
  right: {
    wristPos: [0.75, 0.1, 0.25],
    wristRot: [0.2, -0.4, 0.3],
    thumb: { base: 0.7, mid: 0.6, tip: 0.5, spread: -0.2 },
    index: { base: 0.8, mid: 0.7, tip: 0.6, spread: 0 },
    middle: { base: 0.85, mid: 0.75, tip: 0.6, spread: 0 },
    ring: { base: 0.85, mid: 0.75, tip: 0.6, spread: 0 },
    pinky: { base: 0.8, mid: 0.7, tip: 0.6, spread: 0 },
  },
};

// ── 3. Number 5 Pose ──
// Both hands open with all 5 fingers spread wide
export const POSE_NUMBER_5: DualHandPose = {
  gestureName: '5',
  description: 'Number 5 (Open hand with 5 fingers spread)',
  left: {
    wristPos: [-0.9, -0.15, 0],
    wristRot: [0.1, 0.2, -0.15],
    thumb: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0.4 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.15 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.15 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.35 },
  },
  right: {
    wristPos: [0.9, -0.15, 0],
    wristRot: [0.1, -0.2, 0.15],
    thumb: { base: 0.1, mid: 0.05, tip: 0.05, spread: -0.4 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.15 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.15 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.35 },
  },
};

// ── 4. Equals / Balanced Pose ──
// Both index fingers pointed forward parallel
export const POSE_EQUALS: DualHandPose = {
  gestureName: 'equals',
  description: 'Equals sign (Both index fingers parallel)',
  left: {
    wristPos: [-0.65, -0.2, 0.1],
    wristRot: [0.3, 0.1, -0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: 0.1 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    middle: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
    ring: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
    pinky: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
  },
  right: {
    wristPos: [0.65, -0.2, 0.1],
    wristRot: [0.3, -0.1, 0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: -0.1 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    middle: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
    ring: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
    pinky: { base: 1.3, mid: 1.2, tip: 1.0, spread: 0 },
  },
};

// ── 5. Divide / Fraction Pose ──
// One hand horizontal bar, other hand slicing down
export const POSE_DIVIDE: DualHandPose = {
  gestureName: 'divide',
  description: 'Divide sign (Horizontal fraction bar with vertical division)',
  left: {
    wristPos: [-0.7, -0.25, 0],
    wristRot: [0.1, 0.4, -0.5],
    thumb: { base: 0.2, mid: 0.1, tip: 0.1, spread: 0.2 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
  },
  right: {
    wristPos: [0.75, 0.15, 0.15],
    wristRot: [0.4, -0.2, 0.6],
    thumb: { base: 0.2, mid: 0.1, tip: 0.1, spread: -0.2 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
  },
};

// ── 6. Solve / Solution Pose ──
// Open welcoming hands rising upward with clarity
export const POSE_SOLVE: DualHandPose = {
  gestureName: 'solve',
  description: 'Solve / Solution (Open palms rising)',
  left: {
    wristPos: [-0.85, 0.05, 0.1],
    wristRot: [-0.15, 0.25, -0.3],
    thumb: { base: 0.1, mid: 0.05, tip: 0.05, spread: 0.3 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.1 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.1 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.2 },
  },
  right: {
    wristPos: [0.85, 0.05, 0.1],
    wristRot: [-0.15, -0.25, 0.3],
    thumb: { base: 0.1, mid: 0.05, tip: 0.05, spread: -0.3 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.1 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0 },
    ring: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.1 },
    pinky: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.2 },
  },
};

// ── 7. Variable "x" Pose ──
// Hooked index finger (ASL letter 'X')
export const POSE_VARIABLE_X: DualHandPose = {
  gestureName: 'variable_x',
  description: 'Variable X (Hooked index finger)',
  left: {
    wristPos: [-0.8, -0.15, 0.05],
    wristRot: [0.2, 0.2, -0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: 0.2 },
    index: { base: 0.6, mid: 0.9, tip: 0.8, spread: 0 },
    middle: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    ring: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    pinky: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
  },
  right: {
    wristPos: [0.8, -0.15, 0.05],
    wristRot: [0.2, -0.2, 0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: -0.2 },
    index: { base: 0.6, mid: 0.9, tip: 0.8, spread: 0 },
    middle: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    ring: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    pinky: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
  },
};

// ── 8. Number 2 Pose ──
// Peace / V shape (Index & Middle straight)
export const POSE_NUMBER_2: DualHandPose = {
  gestureName: '2',
  description: 'Number 2 / V shape',
  left: {
    wristPos: [-0.85, -0.1, 0.05],
    wristRot: [0.15, 0.2, -0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: 0.2 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.1 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.1 },
    ring: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    pinky: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
  },
  right: {
    wristPos: [0.85, -0.1, 0.05],
    wristRot: [0.15, -0.2, 0.1],
    thumb: { base: 0.8, mid: 0.7, tip: 0.6, spread: -0.2 },
    index: { base: 0.05, mid: 0.05, tip: 0.05, spread: -0.1 },
    middle: { base: 0.05, mid: 0.05, tip: 0.05, spread: 0.1 },
    ring: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
    pinky: { base: 1.4, mid: 1.3, tip: 1.1, spread: 0 },
  },
};

// Map of gesture names to pose presets
export const ASL_POSE_REGISTRY: Record<string, DualHandPose> = {
  isolate: POSE_ISOLATE_OK,
  subtract: POSE_SUBTRACT,
  '5': POSE_NUMBER_5,
  five: POSE_NUMBER_5,
  equals: POSE_EQUALS,
  divide: POSE_DIVIDE,
  solve: POSE_SOLVE,
  solution: POSE_SOLVE,
  x: POSE_VARIABLE_X,
  variable: POSE_VARIABLE_X,
  '2': POSE_NUMBER_2,
  two: POSE_NUMBER_2,
};

/**
 * Returns the matching pose or falls back to POSE_ISOLATE_OK
 */
export function getPoseForSign(signKey: string): DualHandPose {
  const normalized = signKey.toLowerCase().trim();
  if (ASL_POSE_REGISTRY[normalized]) {
    return ASL_POSE_REGISTRY[normalized];
  }
  // Keyword searching in name
  for (const [key, pose] of Object.entries(ASL_POSE_REGISTRY)) {
    if (normalized.includes(key)) {
      return pose;
    }
  }
  return POSE_ISOLATE_OK;
}
