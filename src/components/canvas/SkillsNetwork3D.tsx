import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

const NODE_COUNT = 52;
const MAX_CONNECTIONS = (NODE_COUNT * (NODE_COUNT - 1)) / 2;
const CONNECTION_DIST = 2.45;

interface BaseNode {
  bx: number;
  by: number;
  bz: number;
  cx: number;
  cy: number;
  cz: number;
  phaseX: number;
  phaseY: number;
  speed: number;
}

/**
 * Phase 7 Interactive 3D Node Network (/skills):
 * - 52 3D constellation nodes with dynamic proximity edges.
 * - Moving the cursor across the screen pulls nearby nodes forward in Z (+1.35 units)
 *   and tightens their web connections in real time at 60fps (zero per-frame allocations).
 * - Adapts to all 5 portfolio Color Themes and Glow: Dark / Light modes.
 */
export function SkillsNetwork3D() {
  const { viewport } = useThree();
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const pointsGeomRef = useRef<THREE.BufferGeometry>(null);
  const linesGeomRef = useRef<THREE.BufferGeometry>(null);
  const cursorHubRef = useRef<THREE.Mesh>(null);

  // Pre-allocate typed arrays once for locked 60fps performance
  const { nodes, nodePositions, linePositions } = useMemo(() => {
    const list: BaseNode[] = [];
    const nPos = new Float32Array(NODE_COUNT * 3);
    const lPos = new Float32Array(MAX_CONNECTIONS * 6);

    for (let i = 0; i < NODE_COUNT; i++) {
      const bx = (Math.random() - 0.5) * 11.5;
      const by = (Math.random() - 0.5) * 6.8;
      const bz = (Math.random() - 0.5) * 2.6 - 0.8;
      list.push({
        bx,
        by,
        bz,
        cx: bx,
        cy: by,
        cz: bz,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.45,
      });
      nPos[i * 3] = bx;
      nPos[i * 3 + 1] = by;
      nPos[i * 3 + 2] = bz;
    }

    return {
      nodes: list,
      nodePositions: nPos,
      linePositions: lPos,
    };
  }, []);

  useFrame((state, delta) => {
    const { dampedPointer, prefersReducedMotion } = useAppStore.getState();
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    // Map normalized pointer [-1, 1] to 3D world coordinates on z=0 plane
    const pointerWorldX = dampedPointer.x * (viewport.width * 0.52);
    const pointerWorldY = dampedPointer.y * (viewport.height * 0.52);

    if (cursorHubRef.current) {
      cursorHubRef.current.position.set(pointerWorldX, pointerWorldY, 0.35);
      cursorHubRef.current.rotation.z = t * 0.9;
      cursorHubRef.current.rotation.x = t * 0.6;
    }

    const lerpFactor = 1 - Math.exp(-6.5 * dt);

    // 1. Update node positions & pull connected nodes near the cursor forward in Z
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      const driftX = prefersReducedMotion
        ? 0
        : Math.sin(t * n.speed + n.phaseX) * 0.28;
      const driftY = prefersReducedMotion
        ? 0
        : Math.cos(t * n.speed + n.phaseY) * 0.28;

      let targetX = n.bx + driftX;
      let targetY = n.by + driftY;
      let targetZ = n.bz;

      const dx = targetX - pointerWorldX;
      const dy = targetY - pointerWorldY;
      const distSq = dx * dx + dy * dy;
      const influenceRadius = 2.85;

      if (distSq < influenceRadius * influenceRadius) {
        const dist = Math.sqrt(distSq);
        const pull = 1 - dist / influenceRadius;
        // Pull node toward cursor XY slightly and strongly forward in Z
        targetX -= dx * pull * 0.24;
        targetY -= dy * pull * 0.24;
        targetZ += pull * 1.45;
      }

      n.cx += (targetX - n.cx) * lerpFactor;
      n.cy += (targetY - n.cy) * lerpFactor;
      n.cz += (targetZ - n.cz) * lerpFactor;

      nodePositions[i * 3] = n.cx;
      nodePositions[i * 3 + 1] = n.cy;
      nodePositions[i * 3 + 2] = n.cz;
    }

    if (pointsGeomRef.current) {
      const attr = pointsGeomRef.current.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }

    // 2. Rebuild dynamic edge connections between nearby nodes + cursor hub
    let lineVertexCount = 0;
    const maxDistSq = CONNECTION_DIST * CONNECTION_DIST;

    for (let i = 0; i < NODE_COUNT; i++) {
      const a = nodes[i];

      // Connect node to cursor hub if within influence radius
      const cdx = a.cx - pointerWorldX;
      const cdy = a.cy - pointerWorldY;
      if (cdx * cdx + cdy * cdy < 2.6 * 2.6) {
        const idx = lineVertexCount * 3;
        linePositions[idx] = a.cx;
        linePositions[idx + 1] = a.cy;
        linePositions[idx + 2] = a.cz;
        linePositions[idx + 3] = pointerWorldX;
        linePositions[idx + 4] = pointerWorldY;
        linePositions[idx + 5] = 0.35;
        lineVertexCount += 2;
      }

      for (let j = i + 1; j < NODE_COUNT; j++) {
        const b = nodes[j];
        const dx = a.cx - b.cx;
        const dy = a.cy - b.cy;
        const dz = a.cz - b.cz;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq < maxDistSq) {
          const idx = lineVertexCount * 3;
          linePositions[idx] = a.cx;
          linePositions[idx + 1] = a.cy;
          linePositions[idx + 2] = a.cz;
          linePositions[idx + 3] = b.cx;
          linePositions[idx + 4] = b.cy;
          linePositions[idx + 5] = b.cz;
          lineVertexCount += 2;
        }
      }
    }

    if (linesGeomRef.current) {
      const attr = linesGeomRef.current.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      attr.needsUpdate = true;
      linesGeomRef.current.setDrawRange(0, lineVertexCount);
    }
  });

  const nodeColor =
    isDark || isCustomTheme ? palette.accentHex : palette.inkHex;
  const lineColor = isDark
    ? palette.accentHex
    : isCustomTheme
    ? palette.panelHex
    : palette.inkHex;

  return (
    <group>
      {/* Cursor 3D Wireframe Attractor Hub */}
      <mesh ref={cursorHubRef}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshBasicMaterial color={nodeColor} wireframe />
      </mesh>

      {/* 3D Node Points */}
      <points>
        <bufferGeometry ref={pointsGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            count={NODE_COUNT}
            array={nodePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.095 : 0.085}
          color={nodeColor}
          transparent
          opacity={isDark ? 0.9 : 0.75}
          sizeAttenuation
        />
      </points>

      {/* Dynamic 3D Constellation Edges */}
      <lineSegments>
        <bufferGeometry ref={linesGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_CONNECTIONS * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={isDark ? 0.34 : 0.22}
        />
      </lineSegments>
    </group>
  );
}
