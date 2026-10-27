import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

const LINK_COUNT = 16;
const LINK_SPACING = 0.28;

/**
 * Phase 8 3D Scroll-Driven Chain & Anchor (/feats):
 * - Positioned along the right viewport edge (`x = viewport.width * 0.43`).
 * - 16 interlocking 3D torus chain links + a 3D geometric anchor at the bottom tip.
 * - Descends smoothly with `featsScrollProgress` and sways like a pendulum with `dampedPointer.x`.
 */
export function FeatsChain3D() {
  const { viewport } = useThree();
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const rootRef = useRef<THREE.Group>(null);
  const anchorRef = useRef<THREE.Group>(null);
  const linkRefs = useRef<(THREE.Mesh | null)[]>([]);
  const smoothProgressRef = useRef(0.12);

  useFrame((state, delta) => {
    const {
      featsScrollProgress,
      dampedPointer,
      scrollVelocity,
      isMobile,
    } = useAppStore.getState();

    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    const lerp = 1 - Math.exp(-7 * dt);
    smoothProgressRef.current +=
      (featsScrollProgress - smoothProgressRef.current) * lerp;
    const prog = smoothProgressRef.current;

    const rightX = viewport.width * (isMobile ? 0.44 : 0.43);
    const topY = viewport.height * 0.46;
    const maxChainSpan = LINK_COUNT * LINK_SPACING;
    const activeLinksFloat = Math.max(2, prog * LINK_COUNT);

    if (rootRef.current) {
      rootRef.current.position.x = rightX;
      rootRef.current.position.y = topY;
      // Gentle pendulum sway driven by cursor X and scroll velocity
      const targetSway =
        dampedPointer.x * 0.08 +
        Math.sin(t * 1.8) * 0.025 +
        Math.max(-0.08, Math.min(0.08, scrollVelocity * 0.002));
      rootRef.current.rotation.z +=
        (targetSway - rootRef.current.rotation.z) * lerp;
    }

    for (let i = 0; i < LINK_COUNT; i++) {
      const mesh = linkRefs.current[i];
      if (!mesh) continue;
      const visibleFraction = Math.max(
        0,
        Math.min(1, activeLinksFloat - i)
      );
      mesh.position.y = -i * LINK_SPACING;
      mesh.scale.setScalar(visibleFraction);
      mesh.rotation.y = (i % 2 === 0 ? 0 : Math.PI / 2) + t * 0.35;
    }

    if (anchorRef.current) {
      const anchorY = -Math.min(maxChainSpan, activeLinksFloat * LINK_SPACING) - 0.32;
      anchorRef.current.position.y = anchorY;
      anchorRef.current.rotation.y = t * 0.65 + dampedPointer.x * 0.5;
    }
  });

  const mainColor =
    isDark || isCustomTheme ? palette.accentHex : palette.inkHex;
  const secondaryColor = isDark ? palette.creamHex : palette.panelHex;

  return (
    <group ref={rootRef}>
      {/* Interlocking 3D Chain Links */}
      {Array.from({ length: LINK_COUNT }).map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            linkRefs.current[idx] = el;
          }}
        >
          <torusGeometry args={[0.13, 0.032, 12, 28]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? mainColor : secondaryColor}
            emissive={isDark ? mainColor : '#000000'}
            emissiveIntensity={isDark ? 1.1 : 0}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* 3D Suspended Geometric Anchor */}
      <group ref={anchorRef}>
        {/* Top Shackle Ring */}
        <mesh position={[0, 0.22, 0]}>
          <torusGeometry args={[0.11, 0.028, 12, 24]} />
          <meshStandardMaterial
            color={mainColor}
            emissive={isDark ? mainColor : '#000000'}
            emissiveIntensity={isDark ? 1.4 : 0}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Vertical Shank */}
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.038, 0.045, 0.56, 12]} />
          <meshStandardMaterial
            color={mainColor}
            emissive={isDark ? mainColor : '#000000'}
            emissiveIntensity={isDark ? 1.2 : 0}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Cross Stock Bar */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.42, 12]} />
          <meshStandardMaterial
            color={secondaryColor}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Curved Crown / Flukes Arc */}
        <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.26, 0.038, 12, 32, Math.PI]} />
          <meshStandardMaterial
            color={mainColor}
            emissive={isDark ? mainColor : '#000000'}
            emissiveIntensity={isDark ? 1.4 : 0}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Left & Right Fluke Cones */}
        <mesh position={[-0.26, -0.14, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.075, 0.16, 6]} />
          <meshStandardMaterial color={mainColor} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.26, -0.14, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.075, 0.16, 6]} />
          <meshStandardMaterial color={mainColor} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}
