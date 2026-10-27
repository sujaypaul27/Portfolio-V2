import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';
import { PROFILE_DATA } from '@/data/portfolioData';
import { soundEngine } from '@/utils/soundEngine';
import { Avatar, AvatarPose } from '@/components/canvas/Avatar';

interface HomeScreenProps {
  replayTrigger: number;
  onReplayIntro: () => void;
}

/**
 * Phase 3, 4 & 9 Signature Transition (1.5s Choreography), Hero Split Screen & Avatar:
 * - Desktop (>= 768px): 50/50 Left-Dark / Right-Cream horizontal split.
 * - Mobile (< 768px): 50/50 Top-Dark / Bottom-Cream vertical split so stacked Hero box
 *   always has Dark Ink behind the top text half and Light Cream behind the bottom Avatar half.
 */
export function HomeScreen({ replayTrigger, onReplayIntro }: HomeScreenProps) {
  const isHeroOpen = useAppStore((s) => s.isHeroOpen);
  const isTransitioning = useAppStore((s) => s.isTransitioning);
  const setHeroOpen = useAppStore((s) => s.setHeroOpen);
  const setTransitioning = useAppStore((s) => s.setTransitioning);
  const setCoreHovered = useAppStore((s) => s.setCoreHovered);
  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const [heroPose, setHeroPose] = useState<AvatarPose>('waving');

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingSplitRef = useRef(false);

  // Clean up timeline only when HomeScreen unmounts
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  // Synchronize split-screen DOM state on mount, replay, or HMR without killing active click transition
  useEffect(() => {
    if (!containerRef.current) return;

    if (!isHeroOpen) {
      isAnimatingSplitRef.current = false;
      tlRef.current?.kill();

      gsap.set('.split-plus-marker', { opacity: 0, scale: 0 });
      gsap.set('.split-hline', {
        scaleX: 0,
        opacity: 1,
        transformOrigin: 'left center',
      });
      gsap.set('.split-vbar', {
        scaleY: 0,
        opacity: 1,
        transformOrigin: 'top center',
      });
      gsap.set('.split-black-panel', { width: '0vw' });
      gsap.set('.split-mobile-top-panel', { height: '0vh' });
      gsap.set('.hero-box-container', {
        clipPath: 'inset(0 100% 0 0)',
        autoAlpha: 0,
      });
      gsap.set('.hero-text-item', { y: 24, opacity: 0 });
      gsap.set('.hero-avatar-slot', { y: 32, opacity: 0 });
      gsap.fromTo(
        '.home-click-caption',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: replayTrigger === 0 ? 3.05 : 0.35,
          ease: 'power3.out',
        }
      );
    } else if (!isAnimatingSplitRef.current) {
      // Mounted or hot-reloaded while Hero is already open: snap directly to open state
      gsap.set('.frame-nav-item', { opacity: 1 });
      gsap.set('.split-plus-marker, .split-hline, .split-vbar', { opacity: 0 });
      gsap.set('.split-black-panel', { width: '50vw' });
      gsap.set('.split-mobile-top-panel', { height: '50vh' });
      gsap.set('.hero-box-container', {
        clipPath: 'inset(0 0% 0 0)',
        autoAlpha: 1,
      });
      gsap.set('.hero-text-item', { y: 0, opacity: 1 });
      gsap.set('.hero-avatar-slot', { y: 0, opacity: 1 });
    }
  }, [isHeroOpen, replayTrigger]);

  const triggerSignatureSplit = () => {
    if (isHeroOpen || isTransitioning) return;

    soundEngine.playSplitWhoosh();
    isAnimatingSplitRef.current = true;
    setCoreHovered(false);
    setHeroOpen(true);
    setTransitioning(true);

    tlRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingSplitRef.current = false;
        setTransitioning(false);
      },
    });
    tlRef.current = tl;

    // 1. T=0.00s: Fade out frame nav items & caption, show "+" marker on the left
    tl.to(
      '.home-click-caption',
      { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' },
      0
    )
      .to(
        '.frame-nav-item',
        { opacity: 0, duration: 0.26, stagger: 0.02, ease: 'power2.inOut' },
        0
      )
      .fromTo(
        '.split-plus-marker',
        { opacity: 0, scale: 0, rotate: -90 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.25,
          ease: 'back.out(2)',
        },
        0.08
      )

      // 2. T=0.20s: Draw short horizontal line (26% width) at 60% height from left to center
      .fromTo(
        '.split-hline',
        { scaleX: 0, opacity: 1, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.34, ease: 'power3.inOut' },
        0.2
      )

      // 3. T=0.50s: Thick vertical bar drops down from the line at 50vw
      .fromTo(
        '.split-vbar',
        { scaleY: 0, opacity: 1, transformOrigin: 'top center' },
        { scaleY: 1, duration: 0.32, ease: 'power3.in' },
        0.5
      )

      // 4. T=0.76s: Dark panel expands (left 50vw on desktop, top 50vh on mobile)
      .to(
        '.split-black-panel',
        { width: '50vw', duration: 0.52, ease: 'power4.inOut' },
        0.76
      )
      .to(
        '.split-mobile-top-panel',
        { height: '50vh', duration: 0.52, ease: 'power4.inOut' },
        0.76
      )
      .to(
        '.split-plus-marker, .split-hline, .split-vbar',
        { opacity: 0, duration: 0.2 },
        1.15
      )

      // 5. T=1.06s: 1px outlined Hero box draws out from left to right & Hero text staggers in
      .fromTo(
        '.hero-box-container',
        { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.58, ease: 'power3.inOut' },
        1.06
      )
      .fromTo(
        '.hero-text-item',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.48,
          stagger: 0.09,
          ease: 'power3.out',
        },
        1.12
      )

      // 6. T=1.24s: Avatar rises in inside the cream half & inverted frame nav returns
      .fromTo(
        '.hero-avatar-slot',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
        1.24
      )
      .to(
        '.frame-nav-item',
        { opacity: 1, duration: 0.38, stagger: 0.035, ease: 'power2.out' },
        1.28
      );
  };

  const handleResetToHome = () => {
    if (isTransitioning) return;
    soundEngine.playClick();
    isAnimatingSplitRef.current = false;
    setCoreHovered(false);
    setTransitioning(false);
    setHeroOpen(false);
    onReplayIntro();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* =====================================================================
          CHOREOGRAPHY GEOMETRY (Line, Vertical Bar, Desktop & Mobile Split Panels)
         ===================================================================== */}

      {/* Small "+" Marker on the Left */}
      <div
        style={{ color: palette.inkHex }}
        className="split-plus-marker pointer-events-none fixed left-[24vw] top-[60vh] -translate-x-1/2 -translate-y-1/2 z-30 font-mono text-xl font-bold opacity-0"
        aria-hidden="true"
      />

      {/* Horizontal Line */}
      <div
        style={{ backgroundColor: palette.inkHex }}
        className="split-hline pointer-events-none fixed left-[24vw] top-[60vh] w-[26vw] h-[2px] z-30 scale-x-0"
        aria-hidden="true"
      />

      {/* Thick Vertical Bar */}
      <div
        style={{ backgroundColor: palette.inkHex }}
        className="split-vbar pointer-events-none fixed left-[calc(50vw-16px)] top-0 w-[16px] h-screen z-30 scale-y-0"
        aria-hidden="true"
      />

      {/* Desktop Left-Expanding Dark Panel (>= 768px: covers left 50vw) */}
      <div
        className="split-black-panel hidden md:block pointer-events-none fixed right-[50vw] top-0 h-screen z-0"
        style={{ width: '0vw', backgroundColor: palette.inkHex }}
        aria-hidden="true"
      />

      {/* Mobile Top-Expanding Dark Panel (< 768px: covers top 50vh for vertical split) */}
      <div
        className="split-mobile-top-panel block md:hidden pointer-events-none fixed inset-x-0 top-0 w-screen z-0"
        style={{ height: '0vh', backgroundColor: palette.inkHex }}
        aria-hidden="true"
      />

      {/* =====================================================================
          HERO SPLIT CONTENT & 1PX SPLIT-BORDER BOX
          - Mobile (< 768px): 84vw x 72vh, grid-rows-2 (Top Dark, Bottom Cream)
          - Desktop (>= 768px): 65vw x 66vh, grid-cols-2 (Left Dark, Right Cream)
         ===================================================================== */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
        <div
          className="hero-box-container relative w-[84vw] md:w-[65vw] h-[72vh] md:h-[66vh] grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 invisible overflow-hidden"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        >
          {/* Top Half (Mobile) / Left Half (Desktop): Dark Side with 1px Cream Border */}
          <div
            style={{
              color: palette.creamHex,
              borderColor: palette.creamHex,
            }}
            className="flex flex-col justify-center px-5 sm:px-9 md:px-12 py-4 sm:py-6 border-t border-l border-r md:border-r-0 md:border-b select-text pointer-events-auto"
          >
            <h1 className="hero-text-item font-sans font-bold text-[clamp(1.85rem,4.2vw,4.8rem)] leading-[1.08] tracking-tight">
              Hi,
            </h1>
            <h2 className="hero-text-item mt-1.5 sm:mt-2 font-sans font-medium text-[clamp(1.2rem,2.35vw,2.75rem)] leading-[1.18]">
              I&apos;m{' '}
              <span
                style={{
                  color:
                    colorTheme !== 'classic'
                      ? palette.accentSoftHex
                      : palette.creamHex,
                }}
              >
                {PROFILE_DATA.name}
              </span>
            </h2>
            <p className="hero-text-item mt-2.5 sm:mt-4 font-sans font-normal opacity-80 text-[clamp(0.82rem,1.45vw,1.65rem)] leading-[1.42]">
              {PROFILE_DATA.heroSubtitle}
            </p>
          </div>

          {/* Bottom Half (Mobile) / Right Half (Desktop): Cream Side with 1px Dark Border */}
          <div
            style={{ borderColor: palette.inkHex }}
            className="relative flex items-end justify-center h-full border-b border-l border-r md:border-l-0 md:border-t overflow-hidden pointer-events-auto"
          >
            <div className="hero-avatar-slot w-full h-full flex items-end justify-center">
              {isHeroOpen && <Avatar pose={heroPose} />}
            </div>

            {/* Subtle Pose Toggle Pill inside top-right of the Hero Box */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setHeroPose((p) => (p === 'waving' ? 'laptop' : 'waving'));
              }}
              onMouseEnter={() => soundEngine.playHoverTick()}
              style={{
                backgroundColor: palette.creamHex,
                color: palette.inkHex,
                borderColor: palette.inkHex,
              }}
              className="absolute top-2.5 right-2.5 z-30 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider hover:!bg-panel hover:!text-cream transition-colors"
              title="Switch Avatar Pose (Waving / Laptop)"
            >
              Pose: {heroPose === 'waving' ? 'Wave' : 'Laptop'}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          INTERACTIVE HIT TARGETS (Center on Home; Lower-Right 88%, 80% on Hero)
         ===================================================================== */}

      {/* Center Hit Target when on Home Screen */}
      {!isHeroOpen && (
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <button
            type="button"
            onClick={triggerSignatureSplit}
            onMouseEnter={() => {
              setCoreHovered(true);
              soundEngine.playHoverTick();
            }}
            onMouseLeave={() => setCoreHovered(false)}
            aria-label="Activate 3D Core and Open Hero Split Screen"
            style={{
              transform: `translate3d(${(dampedPointer.x * 10).toFixed(
                1
              )}px, ${(-dampedPointer.y * 10).toFixed(1)}px, 0)`,
            }}
            className="pointer-events-auto group flex flex-col items-center justify-end w-[220px] h-[255px] focus:outline-none cursor-pointer"
          >
            <span
              style={{
                backgroundColor: palette.creamHex,
                color: palette.inkHex,
              }}
              className="home-click-caption mt-[220px] font-sans text-xs sm:text-sm tracking-[0.12em] lowercase group-hover:tracking-[0.22em] transition-all duration-200 px-2.5 py-0.5 border border-transparent group-hover:border-ink"
            >
              click here
            </span>
          </button>
        </div>
      )}

      {/* Lower-Right Hit Target (88% across, 80% down) when Hero is Open */}
      {isHeroOpen && (
        <button
          type="button"
          onClick={handleResetToHome}
          onMouseEnter={() => {
            setCoreHovered(true);
            soundEngine.playHoverTick();
          }}
          onMouseLeave={() => setCoreHovered(false)}
          aria-label="Return Core to Center"
          title="Return to Home Core"
          className="fixed left-[88%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[96px] h-[96px] rounded-full pointer-events-auto z-40 cursor-pointer focus:outline-none"
        />
      )}
    </div>
  );
}
