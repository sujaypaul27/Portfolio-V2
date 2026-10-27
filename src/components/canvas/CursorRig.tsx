import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

interface CursorRigProps {
  children: React.ReactNode;
}

/**
 * Shared 3D camera & world rig.
 * - Tracks normalized pointer with frame-rate-independent damping.
 * - Executes a 3D camera dolly + subtle perspective roll during the Home -> Hero signature transition.
 * - Supports mouse on desktop, touch drag and DeviceOrientation (gyroscope) on mobile.
 */
export function CursorRig({ children }: CursorRigProps) {
  const worldGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const setPointer = useAppStore((s) => s.setPointer);
  const stepDampedPointer = useAppStore((s) => s.stepDampedPointer);

  useEffect(() => {
    // Reduced-motion / mobile flags are synced at the App root (see App.tsx).

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointer(nx, ny);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const nx = (t.clientX / window.innerWidth) * 2 - 1;
        const ny = -(t.clientY / window.innerHeight) * 2 + 1;
        setPointer(nx, ny);
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const nx = Math.max(-1, Math.min(1, e.gamma / 30));
        const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        setPointer(nx, ny);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [setPointer]);

  useFrame((_, delta) => {
    stepDampedPointer(delta);
    const { dampedPointer, isHeroOpen, isTransitioning } = useAppStore.getState();

    // Camera parallax + 3D dolly kick during signature transition
    const targetCamX = dampedPointer.x * 0.42;
    const targetCamY = dampedPointer.y * 0.32;
    const targetCamZ = isTransitioning ? 5.15 : isHeroOpen ? 5.55 : 6.0;

    const camFactor = 1 - Math.exp(-5.0 * Math.min(delta, 0.1));
    camera.position.x += (targetCamX - camera.position.x) * camFactor;
    camera.position.y += (targetCamY - camera.position.y) * camFactor;
    camera.position.z += (targetCamZ - camera.position.z) * camFactor;
    camera.lookAt(0, 0, 0);

    // Subtle world tilt toward cursor + slight banking roll during transition
    if (worldGroupRef.current) {
      const targetRotY = dampedPointer.x * 0.16;
      const targetRotX = -dampedPointer.y * 0.12;
      const targetRotZ = isTransitioning ? -0.045 : 0;

      worldGroupRef.current.rotation.y +=
        (targetRotY - worldGroupRef.current.rotation.y) * camFactor;
      worldGroupRef.current.rotation.x +=
        (targetRotX - worldGroupRef.current.rotation.x) * camFactor;
      worldGroupRef.current.rotation.z +=
        (targetRotZ - worldGroupRef.current.rotation.z) * camFactor;
    }
  });

  return <group ref={worldGroupRef}>{children}</group>;
}
