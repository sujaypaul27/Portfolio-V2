import { Component, ReactNode, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CursorRig } from './CursorRig';
import { TechCore } from './TechCore';
import { WorkBackdrop3D } from './WorkBackdrop3D';
import { AboutStarfield3D } from './AboutStarfield3D';
import { SkillsNetwork3D } from './SkillsNetwork3D';
import { FeatsChain3D } from './FeatsChain3D';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/**
 * One-time device capability probe. Weak GPUs/CPUs, phones and data-saver users
 * get a lighter render path (lower DPR, no MSAA, no Bloom pass).
 */
function detectLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return fewCores || lowMemory || saveData || coarsePointer;
}

const IS_LOW_END = detectLowEndDevice();

export function SharedCanvas() {
  const location = useLocation();
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isHeroOpen = useAppStore((s) => s.isHeroOpen);
  const prefersReducedMotion = useAppStore((s) => s.prefersReducedMotion);

  // Stop the render loop entirely while the tab is in the background.
  const [isPageVisible, setIsPageVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );
  useEffect(() => {
    const onVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isDark = theme === 'dark';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;
  const enableBloom = !IS_LOW_END && !prefersReducedMotion;

  const isHomeRoute = location.pathname === '/';
  const isWorkRoute = location.pathname === '/work';
  const isAboutRoute = location.pathname === '/about';
  const isSkillsRoute = location.pathname === '/skills';
  const isFeatsRoute = location.pathname === '/feats';

  // Spotlight follows the TechCore from (50%, 50%) to (88%, 80%) when Hero opens
  const spotlightCenter = isHeroOpen ? '88% 80%' : '50% 50%';
  const spotlightRadius = isHeroOpen ? '26%' : '55%';

  return (
    <div className="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
      {/* Reactive lighting aura behind the 3D core on Home */}
      {isHomeRoute && (
        <div
          className="absolute inset-0 transition-all duration-700 pointer-events-none"
          style={{
            background: isDark
              ? `radial-gradient(circle at ${spotlightCenter}, rgb(${palette.inkRgb} / 0.88) 0%, rgb(${palette.accentRgb} / 0.16) 24%, rgb(${palette.creamRgb} / 0) ${spotlightRadius})`
              : `radial-gradient(circle at ${spotlightCenter}, rgb(${palette.inkRgb} / 0.06) 0%, rgb(${palette.creamRgb} / 0) ${spotlightRadius})`,
          }}
        />
      )}

      <CanvasErrorBoundary>
        <Canvas
          dpr={IS_LOW_END ? [1, 1.25] : [1, 1.75]}
          frameloop={isPageVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 100 }}
          gl={{
            antialias: !IS_LOW_END,
            alpha: true,
            powerPreference: IS_LOW_END ? 'low-power' : 'high-performance',
          }}
        >
          <ambientLight intensity={isDark ? 0.45 : 1.35} />
          <directionalLight
            position={[5, 6, 5]}
            intensity={isDark ? 2.4 : 1.2}
            color={isDark ? palette.accentHex : '#ffffff'}
          />
          <pointLight
            position={[-4, -3, 4]}
            intensity={isDark ? 2.8 : 0.5}
            color={isDark ? palette.accentHex : palette.inkHex}
          />

          <Suspense fallback={null}>
            <CursorRig>
              {isHomeRoute && <TechCore />}
              {isWorkRoute && <WorkBackdrop3D />}
              {isAboutRoute && <AboutStarfield3D />}
              {isSkillsRoute && <SkillsNetwork3D />}
              {isFeatsRoute && <FeatsChain3D />}
            </CursorRig>

            {enableBloom && (
              <EffectComposer enableNormalPass={false} multisampling={0}>
                <Bloom
                  luminanceThreshold={isDark ? 0.2 : 0.85}
                  intensity={isDark ? 1.65 : 0.15}
                  mipmapBlur
                />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
