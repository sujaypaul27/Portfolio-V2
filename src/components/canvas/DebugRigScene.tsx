import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

/**
 * Enhanced 3D Centerpiece & Lighting Test Scene:
 * Clearly demonstrates the difference between 'light' and 'dark' theme lighting modes:
 * - Light mode: crisp architectural matte obsidian core, sharp black wireframe, dark ink orbiting particles, subtle studio rim light.
 * - Dark mode: luminous high-bloom cyan/electric-cream emissive core, glowing wireframe aura, bright starlight particles, and intense rim lighting.
 */
export function DebugRigScene() {
  const groupRef = useRef<THREE.Group>(null);
  const outerIcoRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Generate orbiting particle positions
  const particlePositions = useMemo(() => {
    const count = 90;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.45 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const { dampedPointer } = useAppStore.getState();
    const t = state.clock.getElapsedTime();
    const factor = 1 - Math.exp(-7.5 * Math.min(delta, 0.1));

    if (groupRef.current) {
      // Lean toward cursor
      const targetRotY = dampedPointer.x * 0.55;
      const targetRotX = -dampedPointer.y * 0.55;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * factor;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * factor;
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.06;
    }

    if (outerIcoRef.current) {
      outerIcoRef.current.rotation.y += delta * 0.32;
      outerIcoRef.current.rotation.x += delta * 0.18;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.55;
      innerCoreRef.current.rotation.z += delta * 0.35;
      innerCoreRef.current.position.x = dampedPointer.x * 0.12;
      innerCoreRef.current.position.y = dampedPointer.y * 0.12;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.35;
      ring1Ref.current.rotation.x = Math.PI / 2.4 + dampedPointer.y * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.28;
      ring2Ref.current.rotation.x = Math.PI / 3.2 - dampedPointer.x * 0.3;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.12 + dampedPointer.x * 0.25;
      particlesRef.current.rotation.x = -dampedPointer.y * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Solid Inner Core with strong theme-dependent emissive glow */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial
          color={isDark ? '#38bdf8' : '#000000'}
          emissive={isDark ? '#38bdf8' : '#18181b'}
          emissiveIntensity={isDark ? 2.4 : 0.15}
          roughness={isDark ? 0.15 : 0.35}
          metalness={0.85}
        />
        <Edges
          scale={1.02}
          threshold={12}
          color={isDark ? '#ffffff' : '#fbf4f3'}
        />
      </mesh>

      {/* Outer Wireframe Icosahedron Cage */}
      <mesh ref={outerIcoRef}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshStandardMaterial
          color={isDark ? '#e0f2fe' : '#000000'}
          emissive={isDark ? '#38bdf8' : '#000000'}
          emissiveIntensity={isDark ? 1.6 : 0}
          wireframe
        />
      </mesh>

      {/* Gyroscopic Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.36, 0.012, 16, 100]} />
        <meshStandardMaterial
          color={isDark ? '#38bdf8' : '#000000'}
          emissive={isDark ? '#38bdf8' : '#000000'}
          emissiveIntensity={isDark ? 1.8 : 0}
        />
      </mesh>

      {/* Gyroscopic Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.54, 0.008, 16, 100]} />
        <meshStandardMaterial
          color={isDark ? '#fbf4f3' : '#41413e'}
          emissive={isDark ? '#fbf4f3' : '#000000'}
          emissiveIntensity={isDark ? 1.1 : 0}
        />
      </mesh>

      {/* Orbiting Particle Cloud */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.048 : 0.036}
          color={isDark ? '#38bdf8' : '#000000'}
          transparent
          opacity={isDark ? 0.9 : 0.55}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
