import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FixedFrame } from '@/components/frame/FixedFrame';
import { HomeScreen } from '@/screens/HomeScreen';
import {
  useAppStore,
  applyColorThemeToDocument,
} from '@/store/useAppStore';

// Phase 10: the 3D canvas (three.js + postprocessing) and secondary routes are
// split into their own chunks so the frame + home copy paint before WebGL loads.
const SharedCanvas = lazy(() =>
  import('@/components/canvas/SharedCanvas').then((m) => ({
    default: m.SharedCanvas,
  }))
);
const WorkScreen = lazy(() =>
  import('@/screens/WorkScreen').then((m) => ({ default: m.WorkScreen }))
);
const AboutScreen = lazy(() =>
  import('@/screens/AboutScreen').then((m) => ({ default: m.AboutScreen }))
);
const SkillsScreen = lazy(() =>
  import('@/screens/SkillsScreen').then((m) => ({ default: m.SkillsScreen }))
);
const FeatsScreen = lazy(() =>
  import('@/screens/FeatsScreen').then((m) => ({ default: m.FeatsScreen }))
);

// Warm the route chunks once the browser is idle so navigation stays instant.
function prefetchRoutes() {
  void import('@/screens/WorkScreen');
  void import('@/screens/AboutScreen');
  void import('@/screens/SkillsScreen');
  void import('@/screens/FeatsScreen');
}

/** Minimal themed placeholder shown for the split second a route chunk loads. */
function RouteFallback() {
  return (
    <div
      className="fixed inset-0 z-0 bg-ink"
      aria-busy="true"
      aria-label="Loading section"
    />
  );
}

function AppContent() {
  const [replayTrigger, setReplayTrigger] = useState(0);
  const [mountCanvas, setMountCanvas] = useState(false);
  const location = useLocation();
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const setDeviceFlags = useAppStore((s) => s.setDeviceFlags);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    applyColorThemeToDocument(colorTheme);
  }, [colorTheme]);

  // Mount the 3D WebGL canvas right after the first HTML/CSS paint frame
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setMountCanvas(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // Device flags live at the app root so reduced-motion still applies
  // even if WebGL is unavailable and the canvas never mounts.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setDeviceFlags(mediaQuery.matches, window.innerWidth < 768);
    sync();
    window.addEventListener('resize', sync);
    mediaQuery.addEventListener('change', sync);
    return () => {
      window.removeEventListener('resize', sync);
      mediaQuery.removeEventListener('change', sync);
    };
  }, [setDeviceFlags]);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(prefetchRoutes, { timeout: 4000 });
    } else {
      const t = window.setTimeout(prefetchRoutes, 2500);
      return () => window.clearTimeout(t);
    }
  }, []);

  const triggerReplay = () => setReplayTrigger((c) => c + 1);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-cream text-ink">
      {/* Shared 3D R3F Canvas (z-10), lazy-loaded after first paint */}
      {mountCanvas && (
        <Suspense fallback={null}>
          <SharedCanvas />
        </Suspense>
      )}

      {/* Fixed Frame Overlay (z-50, mix-blend-mode: difference, 6 edge labels, social wave rail) */}
      <FixedFrame replayTrigger={replayTrigger} onReplayIntro={triggerReplay} />

      {/* Screen Routes (participate directly in root stacking context: z-0 backgrounds, z-20/z-30 UI) */}
      <div className="relative w-full h-full">
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <HomeScreen
                  replayTrigger={replayTrigger}
                  onReplayIntro={triggerReplay}
                />
              }
            />
            <Route path="/work" element={<WorkScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/skills" element={<SkillsScreen />} />
            <Route path="/feats" element={<FeatsScreen />} />
            <Route
              path="*"
              element={
                <HomeScreen
                  replayTrigger={replayTrigger}
                  onReplayIntro={triggerReplay}
                />
              }
            />
          </Routes>
        </Suspense>
      </div>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
