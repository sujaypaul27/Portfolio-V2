import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

export function AboutStarfield3D() {
  const nearStarsRef = useRef<THREE.Points>(null);
  const farStarsRef = useRef<THREE.Points>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const nearPositions = useMemo(() => {
    const count = 280;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return arr;
  }, []);

  const farPositions = useMemo(() => {
    const count = 520;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = -4 - Math.random() * 10;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const { dampedPointer, prefersReducedMotion } = useAppStore.getState();
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    if (prefersReducedMotion) return;

    const factor = 1 - Math.exp(-4.5 * dt);

    if (nearStarsRef.current) {
      const targetX = -dampedPointer.x * 0.85;
      const targetY = -dampedPointer.y * 0.65;
      nearStarsRef.current.position.x +=
        (targetX - nearStarsRef.current.position.x) * factor;
      nearStarsRef.current.position.y +=
        (targetY - nearStarsRef.current.position.y) * factor;
      nearStarsRef.current.rotation.z = t * 0.018;
      nearStarsRef.current.rotation.y = dampedPointer.x * 0.12;
    }

    if (farStarsRef.current) {
      const targetX = -dampedPointer.x * 0.32;
      const targetY = -dampedPointer.y * 0.24;
      farStarsRef.current.position.x +=
        (targetX - farStarsRef.current.position.x) * factor;
      farStarsRef.current.position.y +=
        (targetY - farStarsRef.current.position.y) * factor;
      farStarsRef.current.rotation.z = -t * 0.009;
    }

    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z = t * 0.05;
      ringGroupRef.current.rotation.x =
        Math.PI / 2.6 + dampedPointer.y * 0.18;
      ringGroupRef.current.rotation.y = dampedPointer.x * 0.18;
    }
  });

  const primaryStarColor =
    isDark || isCustomTheme ? palette.accentHex : palette.creamHex;

  return (
    <group>
      <points ref={nearStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nearPositions.length / 3}
            array={nearPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.056 : 0.046}
          color={primaryStarColor}
          transparent
          opacity={isDark ? 0.92 : 0.82}
          sizeAttenuation
        />
      </points>

      <points ref={farStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={farPositions.length / 3}
            array={farPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={isCustomTheme ? palette.accentSoftHex : palette.creamHex}
          transparent
          opacity={isDark ? 0.6 : 0.48}
          sizeAttenuation
        />
      </points>

      <group ref={ringGroupRef} position={[2.4, -0.2, -3.2]}>
        <mesh>
          <torusGeometry args={[2.1, 0.007, 16, 100]} />
          <meshBasicMaterial
            color={primaryStarColor}
            transparent
            opacity={isDark ? 0.36 : 0.24}
          />
        </mesh>
        <mesh rotation={[0.4, 0.3, 0]}>
          <torusGeometry args={[2.65, 0.005, 16, 100]} />
          <meshBasicMaterial
            color={palette.creamHex}
            transparent
            opacity={isDark ? 0.22 : 0.14}
          />
        </mesh>
      </group>
    </group>
  );
}
