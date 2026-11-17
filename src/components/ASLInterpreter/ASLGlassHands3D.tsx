import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DualHandPose, POSE_ISOLATE_OK } from './aslGestures';

interface ASLGlassHands3DProps {
  currentPose?: DualHandPose;
  className?: string;
  showMotionArcs?: boolean;
}

interface FingerMeshGroup {
  baseGroup: THREE.Group;
  midGroup: THREE.Group;
  tipGroup: THREE.Group;
}

interface HandMeshRig {
  root: THREE.Group;
  wristMesh: THREE.Mesh;
  palmMesh: THREE.Mesh;
  thumb: FingerMeshGroup;
  index: FingerMeshGroup;
  middle: FingerMeshGroup;
  ring: FingerMeshGroup;
  pinky: FingerMeshGroup;
  targetPose: DualHandPose['left'];
}

export const ASLGlassHands3D: React.FC<ASLGlassHands3DProps> = ({
  currentPose = POSE_ISOLATE_OK,
  className = '',
  showMotionArcs = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const poseRef = useRef<DualHandPose>(currentPose);

  // Keep latest pose in ref for the render loop
  useEffect(() => {
    poseRef.current = currentPose;
  }, [currentPose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. THREE.JS SCENE SETUP ──
    const scene = new THREE.Scene();

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 220;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // ── 2. ETHEREAL GLASS LIGHTING ──
    // Subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Front soft key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(0, 3, 4);
    scene.add(keyLight);

    // Left lavender rim light (matches screenshot purple glow)
    const leftRim = new THREE.PointLight(0xc084fc, 5.0, 15);
    leftRim.position.set(-3.5, 1.5, 1.5);
    scene.add(leftRim);

    // Right fuchsia/violet rim light
    const rightRim = new THREE.PointLight(0xe879f9, 5.0, 15);
    rightRim.position.set(3.5, 1.5, 1.5);
    scene.add(rightRim);

    // Bottom cosmic purple bounce light
    const bottomGlow = new THREE.PointLight(0x7e22ce, 4.0, 12);
    bottomGlow.position.set(0, -3, 1);
    scene.add(bottomGlow);

    // ── 3. TRANSLUCENT FROSTED GLASS MATERIAL ──
    // High-transmission, physical glass with soft violet subsurface scatter
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xfcf8ff),
      emissive: new THREE.Color(0x381254),
      emissiveIntensity: 0.28,
      roughness: 0.18,
      metalness: 0.05,
      transmission: 0.88,
      ior: 1.42,
      thickness: 1.1,
      specularColor: new THREE.Color(0xffffff),
      specularIntensity: 1.2,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });

    // ── 4. BUILD PROCEDURAL ARTICULATED 3D HAND RIG ──
    const createFinger = (
      lengths: [number, number, number],
      radii: [number, number, number],
      isThumb: boolean = false
    ): FingerMeshGroup => {
      // 1. Base Joint & Proximal Phalanx
      const baseGroup = new THREE.Group();

      const jointGeo1 = new THREE.SphereGeometry(radii[0] * 1.05, 16, 16);
      const jointMesh1 = new THREE.Mesh(jointGeo1, glassMaterial);
      baseGroup.add(jointMesh1);

      const boneGeo1 = new THREE.CylinderGeometry(radii[1], radii[0], lengths[0], 16);
      boneGeo1.translate(0, lengths[0] / 2, 0);
      const boneMesh1 = new THREE.Mesh(boneGeo1, glassMaterial);
      baseGroup.add(boneMesh1);

      // 2. Mid Joint & Intermediate Phalanx
      const midGroup = new THREE.Group();
      midGroup.position.y = lengths[0];

      const jointGeo2 = new THREE.SphereGeometry(radii[1] * 1.05, 16, 16);
      const jointMesh2 = new THREE.Mesh(jointGeo2, glassMaterial);
      midGroup.add(jointMesh2);

      const boneGeo2 = new THREE.CylinderGeometry(radii[2], radii[1], lengths[1], 16);
      boneGeo2.translate(0, lengths[1] / 2, 0);
      const boneMesh2 = new THREE.Mesh(boneGeo2, glassMaterial);
      midGroup.add(boneMesh2);

      // 3. Tip Joint & Distal Phalanx with rounded fingertip
      const tipGroup = new THREE.Group();
      tipGroup.position.y = lengths[1];

      const jointGeo3 = new THREE.SphereGeometry(radii[2] * 1.05, 16, 16);
      const jointMesh3 = new THREE.Mesh(jointGeo3, glassMaterial);
      tipGroup.add(jointMesh3);

      const boneGeo3 = new THREE.CylinderGeometry(radii[2] * 0.8, radii[2], lengths[2], 16);
      boneGeo3.translate(0, lengths[2] / 2, 0);
      const boneMesh3 = new THREE.Mesh(boneGeo3, glassMaterial);
      tipGroup.add(boneMesh3);

      const tipCapGeo = new THREE.SphereGeometry(radii[2] * 0.8, 16, 16);
      tipCapGeo.translate(0, lengths[2], 0);
      const tipCapMesh = new THREE.Mesh(tipCapGeo, glassMaterial);
      tipGroup.add(tipCapMesh);

      midGroup.add(tipGroup);
      baseGroup.add(midGroup);

      return { baseGroup, midGroup, tipGroup };
    };

    const buildHand = (isLeft: boolean): HandMeshRig => {
      const root = new THREE.Group();
      const signMultiplier = isLeft ? -1 : 1;

      // Forearm / Wrist connector
      const wristGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.55, 20);
      wristGeo.translate(0, -0.4, 0);
      const wristMesh = new THREE.Mesh(wristGeo, glassMaterial);
      root.add(wristMesh);

      // Central Palm body (sculpted curved block)
      const palmGeo = new THREE.BoxGeometry(0.68, 0.72, 0.24, 4, 4, 2);
      palmGeo.translate(0, 0.15, 0);
      const palmMesh = new THREE.Mesh(palmGeo, glassMaterial);
      root.add(palmMesh);

      // Thumb
      const thumb = createFinger([0.3, 0.26, 0.22], [0.11, 0.1, 0.09], true);
      thumb.baseGroup.position.set(signMultiplier * -0.32, 0.05, 0.06);
      thumb.baseGroup.rotation.z = signMultiplier * 0.65;
      thumb.baseGroup.rotation.y = signMultiplier * -0.35;
      root.add(thumb.baseGroup);

      // Index Finger
      const index = createFinger([0.34, 0.26, 0.22], [0.1, 0.09, 0.08]);
      index.baseGroup.position.set(signMultiplier * -0.22, 0.52, 0);
      root.add(index.baseGroup);

      // Middle Finger (longest)
      const middle = createFinger([0.38, 0.3, 0.24], [0.1, 0.09, 0.08]);
      middle.baseGroup.position.set(signMultiplier * -0.07, 0.54, 0);
      root.add(middle.baseGroup);

      // Ring Finger
      const ring = createFinger([0.33, 0.26, 0.21], [0.095, 0.085, 0.075]);
      ring.baseGroup.position.set(signMultiplier * 0.08, 0.51, 0);
      root.add(ring.baseGroup);

      // Pinky Finger (smallest)
      const pinky = createFinger([0.27, 0.2, 0.18], [0.085, 0.075, 0.065]);
      pinky.baseGroup.position.set(signMultiplier * 0.23, 0.44, 0);
      root.add(pinky.baseGroup);

      scene.add(root);

      return {
        root,
        wristMesh,
        palmMesh,
        thumb,
        index,
        middle,
        ring,
        pinky,
        targetPose: isLeft ? POSE_ISOLATE_OK.left : POSE_ISOLATE_OK.right,
      };
    };

    const leftHand = buildHand(true);
    const rightHand = buildHand(false);

    // Initial positioning matching user screenshot
    leftHand.root.position.set(-0.95, -0.1, 0.1);
    rightHand.root.position.set(0.95, -0.1, 0.1);

    // ── 5. ANIMATION & JOINT INTERPOLATION LOOP ──
    let animId = 0;
    let clock = new THREE.Clock();

    const applyFingerRotations = (
      finger: FingerMeshGroup,
      target: { base: number; mid: number; tip: number; spread?: number },
      spreadAxis: number = 1
    ) => {
      // Smooth interpolation (lerp factor 0.1)
      const lerpSpeed = 0.1;
      finger.baseGroup.rotation.x = THREE.MathUtils.lerp(
        finger.baseGroup.rotation.x,
        target.base,
        lerpSpeed
      );
      finger.midGroup.rotation.x = THREE.MathUtils.lerp(
        finger.midGroup.rotation.x,
        target.mid,
        lerpSpeed
      );
      finger.tipGroup.rotation.x = THREE.MathUtils.lerp(
        finger.tipGroup.rotation.x,
        target.tip,
        lerpSpeed
      );

      if (target.spread !== undefined) {
        finger.baseGroup.rotation.z = THREE.MathUtils.lerp(
          finger.baseGroup.rotation.z,
          target.spread * spreadAxis,
          lerpSpeed
        );
      }
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const currentDualPose = poseRef.current || POSE_ISOLATE_OK;

      // Subtle organic breathing float
      const breatheLeft = Math.sin(elapsed * 1.8) * 0.025;
      const breatheRight = Math.cos(elapsed * 1.8 + 0.5) * 0.025;

      // ── Update Left Hand ──
      const lPose = currentDualPose.left;
      leftHand.root.position.x = THREE.MathUtils.lerp(
        leftHand.root.position.x,
        lPose.wristPos[0],
        0.08
      );
      leftHand.root.position.y = THREE.MathUtils.lerp(
        leftHand.root.position.y,
        lPose.wristPos[1] + breatheLeft,
        0.08
      );
      leftHand.root.position.z = THREE.MathUtils.lerp(
        leftHand.root.position.z,
        lPose.wristPos[2],
        0.08
      );

      leftHand.root.rotation.x = THREE.MathUtils.lerp(
        leftHand.root.rotation.x,
        lPose.wristRot[0],
        0.08
      );
      leftHand.root.rotation.y = THREE.MathUtils.lerp(
        leftHand.root.rotation.y,
        lPose.wristRot[1],
        0.08
      );
      leftHand.root.rotation.z = THREE.MathUtils.lerp(
        leftHand.root.rotation.z,
        lPose.wristRot[2],
        0.08
      );

      applyFingerRotations(leftHand.thumb, lPose.thumb, 1);
      applyFingerRotations(leftHand.index, lPose.index, 1);
      applyFingerRotations(leftHand.middle, lPose.middle, 1);
      applyFingerRotations(leftHand.ring, lPose.ring, 1);
      applyFingerRotations(leftHand.pinky, lPose.pinky, 1);

      // ── Update Right Hand ──
      const rPose = currentDualPose.right;
      rightHand.root.position.x = THREE.MathUtils.lerp(
        rightHand.root.position.x,
        rPose.wristPos[0],
        0.08
      );
      rightHand.root.position.y = THREE.MathUtils.lerp(
        rightHand.root.position.y,
        rPose.wristPos[1] + breatheRight,
        0.08
      );
      rightHand.root.position.z = THREE.MathUtils.lerp(
        rightHand.root.position.z,
        rPose.wristPos[2],
        0.08
      );

      rightHand.root.rotation.x = THREE.MathUtils.lerp(
        rightHand.root.rotation.x,
        rPose.wristRot[0],
        0.08
      );
      rightHand.root.rotation.y = THREE.MathUtils.lerp(
        rightHand.root.rotation.y,
        rPose.wristRot[1],
        0.08
      );
      rightHand.root.rotation.z = THREE.MathUtils.lerp(
        rightHand.root.rotation.z,
        rPose.wristRot[2],
        0.08
      );

      applyFingerRotations(rightHand.thumb, rPose.thumb, -1);
      applyFingerRotations(rightHand.index, rPose.index, -1);
      applyFingerRotations(rightHand.middle, rPose.middle, -1);
      applyFingerRotations(rightHand.ring, rPose.ring, -1);
      applyFingerRotations(rightHand.pinky, rPose.pinky, -1);

      renderer.render(scene, camera);
    };

    animate();

    // ── 6. RESIZE HANDLER ──
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 280;
      const newH = container.clientHeight || 220;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // ── CLEANUP ──
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      glassMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* ── BACKGROUND WATERMARK: FAINT WHITEBOARD MATH SKETCH (MATCHES SCREENSHOT) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.22] mix-blend-multiply"
        viewBox="0 0 300 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Coordinate axes on left */}
        <line x1="20" y1="170" x2="140" y2="170" stroke="#475569" strokeWidth="1.2" />
        <line x1="75" y1="110" x2="75" y2="210" stroke="#475569" strokeWidth="1.2" />
        <line x1="30" y1="195" x2="120" y2="135" stroke="#475569" strokeWidth="1.2" />
        <text x="35" y="132" fill="#475569" fontSize="11" fontFamily="sans-serif">
          f(x)
        </text>
        <text x="125" y="178" fill="#475569" fontSize="10" fontFamily="sans-serif">
          x
        </text>

        {/* Triangle geometry with vertex 'a' on right */}
        <polygon
          points="180,185 245,185 245,120"
          stroke="#475569"
          strokeWidth="1.2"
          fill="none"
        />
        <path d="M230,185 A15,15 0 0,0 238,177" stroke="#475569" strokeWidth="1.2" fill="none" />
        <text x="205" y="202" fill="#475569" fontSize="11" fontFamily="sans-serif">
          a
        </text>
      </svg>

      {/* ── GESTURE MOTION ARCS (VISIBLE IN SCREENSHOT ABOVE HANDS) ── */}
      {showMotionArcs && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 300 240"
          fill="none"
        >
          {/* Curved sweep arc over left hand */}
          <path
            d="M 50 85 C 90 55, 125 65, 145 80"
            stroke="#9333EA"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
          {/* Curved motion arc over right hand */}
          <path
            d="M 230 65 C 255 70, 270 85, 275 105"
            stroke="#9333EA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};
