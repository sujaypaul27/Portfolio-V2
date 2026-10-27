import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

export function WorkBackdrop3D() {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const particlePositions = useMemo(() => {
    const count = 160;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = -1.5 - Math.random() * 6;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const { dampedPointer, scrollVelocity } = useAppStore.getState();
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      const targetX =
        -dampedPointer.x * 0.45 -
        Math.max(-2.5, Math.min(2.5, scrollVelocity * 0.008));
      const targetY = -dampedPointer.y * 0.3;
      const targetRotY =
        dampedPointer.x * 0.18 +
        Math.max(-0.25, Math.min(0.25, scrollVelocity * 0.0015));

      const factor = 1 - Math.exp(-5 * dt);
      groupRef.current.position.x +=
        (targetX - groupRef.current.position.x) * factor;
      groupRef.current.position.y +=
        (targetY - groupRef.current.position.y) * factor;
      groupRef.current.rotation.y +=
        (targetRotY - groupRef.current.rotation.y) * factor;
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.z = Math.sin(t * 0.25) * 0.06;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.03;
    }
  });

  const wireColor =
    isDark || isCustomTheme ? palette.accentHex : palette.creamHex;

  return (
    <group ref={groupRef} position={[0, 0, -2.2]}>
      <group ref={ringsRef}>
        {[-1.6, 0, 1.6].map((yOffset, idx) => (
          <mesh
            key={idx}
            position={[0, yOffset, -1.2 - idx * 0.4]}
            rotation={[Math.PI / 2.15, 0, 0]}
          >
            <torusGeometry args={[4.8 + idx * 0.9, 0.007, 12, 96]} />
            <meshBasicMaterial
              color={wireColor}
              transparent
              opacity={isDark ? 0.32 : 0.22}
            />
          </mesh>
        ))}
      </group>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.048 : 0.038}
          color={wireColor}
          transparent
          opacity={isDark ? 0.65 : 0.45}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
