import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ExoOrb3DProps {
  size?: number; // pixel width/height (default: 180)
  interactive?: boolean;
  onOrbClick?: () => void;
  isJumping?: boolean;
  isListening?: boolean;
  listeningVolume?: number;
}

export const ExoOrb3D: React.FC<ExoOrb3DProps> = ({
  size = 180,
  interactive = true,
  onOrbClick,
  isListening = false,
  listeningVolume = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth audio volume ref
  const audioVolRef = useRef(0);
  const targetAudioVolRef = useRef(0);
  targetAudioVolRef.current = isListening ? listeningVolume : 0;
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  // Animation & expression states
  const stateRef = useRef({
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    revolving: false,
    revolveProgress: 0,
    blinkScale: 1,
    isWinking: false,
    showBlush: false,
    isDirty: true,
  });

  // Track mouse coordinates for 3D look-at
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      // Smooth 3D rotation limits: pitch (X) and yaw (Y)
      stateRef.current.targetRotY = Math.max(-0.55, Math.min(0.55, dx * 0.5));
      stateRef.current.targetRotX = Math.max(-0.4, Math.min(0.4, -dy * 0.35));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Periodic natural blinking
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const blinkInterval = setInterval(() => {
      stateRef.current.blinkScale = 0.08;
      stateRef.current.isDirty = true;
      blinkTimeout = setTimeout(() => {
        stateRef.current.blinkScale = 1;
        stateRef.current.isDirty = true;
      }, 160);
    }, 3800);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Periodic 360-degree True 3D Revolution Turn (every 6.5s)
  useEffect(() => {
    if (!interactive) return;

    const revolveInterval = setInterval(() => {
      if (!stateRef.current.revolving) {
        stateRef.current.revolving = true;
        stateRef.current.revolveProgress = 0;
      }
    }, 6500);

    return () => clearInterval(revolveInterval);
  }, [interactive]);

  // Occasional cute winking & blush
  useEffect(() => {
    const winkInterval = setInterval(() => {
      if (!stateRef.current.revolving && Math.random() > 0.45) {
        stateRef.current.isWinking = true;
        stateRef.current.showBlush = true;
        stateRef.current.isDirty = true;
        setTimeout(() => {
          stateRef.current.isWinking = false;
          stateRef.current.showBlush = false;
          stateRef.current.isDirty = true;
        }, 1300);
      }
    }, 8500);

    return () => clearInterval(winkInterval);
  }, []);

  // Setup Three.js 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !canvasRef.current) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 4.9;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 2. Sphere Gradient Texture
    const sphereTexCanvas = document.createElement('canvas');
    sphereTexCanvas.width = 512;
    sphereTexCanvas.height = 512;
    const sCtx = sphereTexCanvas.getContext('2d')!;

    const grad = sCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#FFE8F8');
    grad.addColorStop(0.2, '#F472B6');
    grad.addColorStop(0.48, '#9333EA');
    grad.addColorStop(0.72, '#6366F1');
    grad.addColorStop(1, '#312E81');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 512, 512);

    // Cyan reflection on bottom-left
    const cyanGrad = sCtx.createRadialGradient(100, 420, 20, 100, 420, 260);
    cyanGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
    cyanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    sCtx.fillStyle = cyanGrad;
    sCtx.fillRect(0, 0, 512, 512);

    // Magenta reflection on right
    const pinkGrad = sCtx.createRadialGradient(420, 360, 20, 420, 360, 280);
    pinkGrad.addColorStop(0, 'rgba(236, 72, 153, 0.55)');
    pinkGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
    sCtx.fillStyle = pinkGrad;
    sCtx.fillRect(0, 0, 512, 512);

    const sphereTexture = new THREE.CanvasTexture(sphereTexCanvas);
    sphereTexture.colorSpace = THREE.SRGBColorSpace;

    // 3. 3D Sphere Geometry & Material
    const sphereRadius = 1.6;
    const geometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      map: sphereTexture,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // 4. Dynamic Face Canvas Texture (Upward Chevron Eyes + Blush)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 256;
    const fCtx = faceCanvas.getContext('2d')!;

    const drawFace = () => {
      fCtx.clearRect(0, 0, 512, 256);

      const centerX = 256;
      const centerY = 105; // positioned slightly above center
      const eyeSpacing = 48;
      const eyeWidth = 38;
      const eyeHeight = 26;

      fCtx.save();
      fCtx.lineWidth = 8.5;
      fCtx.lineCap = 'round';
      fCtx.lineJoin = 'round';
      fCtx.strokeStyle = '#FFFFFF';
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      fCtx.shadowBlur = 10;
      fCtx.shadowOffsetY = 3;

      const blink = stateRef.current.blinkScale;
      const isWink = stateRef.current.isWinking;

      // Left Eye: Upward Chevron
      fCtx.save();
      fCtx.translate(centerX - eyeSpacing, centerY);
      fCtx.scale(1, blink);
      fCtx.beginPath();
      fCtx.moveTo(-eyeWidth / 2, eyeHeight / 2);
      fCtx.lineTo(0, -eyeHeight / 2);
      fCtx.lineTo(eyeWidth / 2, eyeHeight / 2);
      fCtx.stroke();
      fCtx.restore();

      // Right Eye: Winking Curve or Upward Chevron
      fCtx.save();
      fCtx.translate(centerX + eyeSpacing, centerY);
      if (isWink) {
        fCtx.beginPath();
        fCtx.arc(0, 2, eyeWidth / 2.2, 0.1 * Math.PI, 0.9 * Math.PI, false);
        fCtx.stroke();
      } else {
        fCtx.scale(1, blink);
        fCtx.beginPath();
        fCtx.moveTo(-eyeWidth / 2, eyeHeight / 2);
        fCtx.lineTo(0, -eyeHeight / 2);
        fCtx.lineTo(eyeWidth / 2, eyeHeight / 2);
        fCtx.stroke();
      }
      fCtx.restore();

      // Cute Cheek Blush
      if (stateRef.current.showBlush) {
        fCtx.fillStyle = 'rgba(244, 114, 182, 0.75)';
        fCtx.shadowColor = 'rgba(244, 114, 182, 0.85)';
        fCtx.shadowBlur = 14;
        fCtx.beginPath();
        fCtx.ellipse(centerX - eyeSpacing - 14, centerY + 26, 17, 10, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.beginPath();
        fCtx.ellipse(centerX + eyeSpacing + 14, centerY + 26, 17, 10, 0, 0, Math.PI * 2);
        fCtx.fill();
      }

      fCtx.restore();
    };

    drawFace();
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.needsUpdate = true;

    // Attach Face Plane directly to sphereMesh in 3D
    const faceGeometry = new THREE.PlaneGeometry(1.75, 0.95);
    const faceMaterial = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.position.set(0, 0.05, sphereRadius + 0.015);
    sphereMesh.add(faceMesh);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(-2.5, 3.5, 3.8);
    scene.add(keyLight);

    const rimLightRight = new THREE.DirectionalLight(0xf472b6, 2.0);
    rimLightRight.position.set(3, -2, -1);
    scene.add(rimLightRight);

    const rimLightLeft = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLightLeft.position.set(-3, -1.5, 0.8);
    scene.add(rimLightLeft);

    // 6. Animation Render Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle 360-degree True 3D Revolution
      let revolveAngle = 0;
      if (stateRef.current.revolving) {
        stateRef.current.revolveProgress += 0.016;

        const t = stateRef.current.revolveProgress;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        revolveAngle = eased * (Math.PI * 2);

        if (stateRef.current.revolveProgress >= 1) {
          stateRef.current.revolving = false;
          stateRef.current.revolveProgress = 0;
          revolveAngle = 0;
        }
      }

      // Smooth mouse look-at lerp
      stateRef.current.currentRotY += (stateRef.current.targetRotY - stateRef.current.currentRotY) * 0.1;
      stateRef.current.currentRotX += (stateRef.current.targetRotX - stateRef.current.currentRotX) * 0.1;

      // Apply to sphereMesh in TRUE 3D space
      sphereMesh.rotation.y = revolveAngle + stateRef.current.currentRotY;
      sphereMesh.rotation.x = stateRef.current.currentRotX;

      // Smooth audio pulse lerp (60-144fps, zero jitter)
      const targetVol = isListeningRef.current ? targetAudioVolRef.current : 0;
      const rate = targetVol > audioVolRef.current ? 0.22 : 0.09;
      audioVolRef.current += (targetVol - audioVolRef.current) * rate;
      const targetScale = 1 + audioVolRef.current * 0.14;
      sphereMesh.scale.setScalar(targetScale);

      // Only update face texture when facial expression actually changes (avoids 60fps GPU texture re-uploads)
      if (stateRef.current.isDirty) {
        drawFace();
        faceTexture.needsUpdate = true;
        stateRef.current.isDirty = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      sphereTexture.dispose();
      faceGeometry.dispose();
      faceMaterial.dispose();
      faceTexture.dispose();
      renderer.dispose();
    };
  }, [size]);

  const handleCanvasClick = () => {
    if (!stateRef.current.revolving) {
      stateRef.current.revolving = true;
      stateRef.current.revolveProgress = 0;
      stateRef.current.showBlush = true;
      setTimeout(() => {
        stateRef.current.showBlush = false;
      }, 1400);
    }
    if (onOrbClick) onOrbClick();
  };

  return (
    <div 
      ref={mountRef} 
      onClick={handleCanvasClick}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full drop-shadow-[0_20px_45px_rgba(112,66,248,0.38)]"
      />
    </div>
  );
};
