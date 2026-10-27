import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

export function TechCore() {
  const rootRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const outerIcoRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const { viewport } = useThree();
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const particlePositions = useMemo(() => {
    const count = 84;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.35 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const {
      dampedPointer,
      isHeroOpen,
      isTransitioning,
      coreHovered,
      isMobile,
    } = useAppStore.getState();

    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    if (rootRef.current) {
      const targetX = isHeroOpen
        ? viewport.width * (isMobile ? 0.34 : 0.38)
        : 0;
      const targetY = isHeroOpen
        ? -viewport.height * (isMobile ? 0.36 : 0.3) + Math.sin(t * 1.6) * 0.04
        : Math.sin(t * 1.4) * 0.06;
      const targetZ = isTransitioning ? 0.65 : 0;

      const baseScale = isHeroOpen ? (isMobile ? 0.38 : 0.48) : 1.0;
      const hoverMultiplier = coreHovered ? (isHeroOpen ? 1.15 : 1.1) : 1.0;
      const targetScale = baseScale * hoverMultiplier;

      const moveFactor = 1 - Math.exp(-5.8 * dt);
      rootRef.current.position.x +=
        (targetX - rootRef.current.position.x) * moveFactor;
      rootRef.current.position.y +=
        (targetY - rootRef.current.position.y) * moveFactor;
      rootRef.current.position.z +=
        (targetZ - rootRef.current.position.z) * moveFactor;

      const currentScale = rootRef.current.scale.x;
      const nextScale =
        currentScale + (targetScale - currentScale) * moveFactor;
      rootRef.current.scale.setScalar(nextScale);
    }

    if (tiltGroupRef.current) {
      const leanFactor = 1 - Math.exp(-7.5 * dt);
      const targetRotY = dampedPointer.x * 0.55;
      const targetRotX = -dampedPointer.y * 0.55;
      tiltGroupRef.current.rotation.y +=
        (targetRotY - tiltGroupRef.current.rotation.y) * leanFactor;
      tiltGroupRef.current.rotation.x +=
        (targetRotX - tiltGroupRef.current.rotation.x) * leanFactor;
    }

    const speedBoost = isTransitioning ? 4.2 : coreHovered ? 2.1 : 1.0;

    if (outerIcoRef.current) {
      outerIcoRef.current.rotation.y += dt * 0.95 * speedBoost;
      outerIcoRef.current.rotation.x += dt * 0.42 * speedBoost;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= dt * 1.15 * speedBoost;
      innerCoreRef.current.rotation.z += dt * 0.65 * speedBoost;
      innerCoreRef.current.position.x = dampedPointer.x * 0.1;
      innerCoreRef.current.position.y = dampedPointer.y * 0.1;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * 0.55 * speedBoost;
      ring1Ref.current.rotation.x = Math.PI / 2.4 + dampedPointer.y * 0.32;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= dt * 0.45 * speedBoost;
      ring2Ref.current.rotation.x = Math.PI / 3.2 - dampedPointer.x * 0.32;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += dt * 0.22 * speedBoost;
      particlesRef.current.rotation.x = -dampedPointer.y * 0.25;
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={tiltGroupRef}>
        {/* Solid Inner Faceted Core */}
        <mesh ref={innerCoreRef}>
          <icosahedronGeometry args={[0.56, 0]} />
          <meshStandardMaterial
            color={
              isDark
                ? palette.accentHex
                : isCustomTheme
                ? palette.panelHex
                : palette.inkHex
            }
            emissive={
              isDark
                ? palette.accentHex
                : isCustomTheme
                ? palette.accentHex
                : palette.panelHex
            }
            emissiveIntensity={isDark ? 2.5 : isCustomTheme ? 0.65 : 0.3}
            roughness={isDark ? 0.15 : 0.35}
            metalness={0.85}
          />
          <Edges
            scale={1.03}
            threshold={12}
            color={
              isDark
                ? '#ffffff'
                : isCustomTheme
                ? palette.accentHex
                : palette.creamHex
            }
          />
        </mesh>

        {/* Outer Glowing Wireframe Icosahedron */}
        <mesh ref={outerIcoRef}>
          <icosahedronGeometry args={[1.02, 1]} />
          <meshStandardMaterial
            color={
              isDark
                ? palette.accentSoftHex
                : isCustomTheme
                ? palette.panelHex
                : palette.inkHex
            }
            emissive={isDark ? palette.accentHex : palette.inkHex}
            emissiveIntensity={isDark ? 1.7 : 0}
            wireframe
          />
        </mesh>

        {/* Orbital Ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.28, 0.012, 16, 100]} />
          <meshStandardMaterial
            color={
              isDark || isCustomTheme ? palette.accentHex : palette.inkHex
            }
            emissive={isDark ? palette.accentHex : palette.inkHex}
            emissiveIntensity={isDark ? 1.8 : 0}
          />
        </mesh>

        {/* Orbital Ring 2 */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[1.44, 0.008, 16, 100]} />
          <meshStandardMaterial
            color={isDark ? palette.creamHex : palette.panelHex}
            emissive={isDark ? palette.creamHex : palette.inkHex}
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
            size={isDark ? 0.048 : 0.04}
            color={
              isDark || isCustomTheme ? palette.accentHex : palette.inkHex
            }
            transparent
            opacity={isDark ? 0.92 : 0.72}
            sizeAttenuation
          />
        </points>
      </group>
    </group>
  );
}
