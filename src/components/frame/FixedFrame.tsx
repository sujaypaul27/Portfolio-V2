import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  Github,
  Linkedin,
  Code2,
  Terminal,
  Trophy,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Palette,
  Check,
  ChevronDown,
  Compass,
  X,
  Home,
  Layers,
  User,
  Cpu,
  Award,
  FileText,
  Activity,
} from 'lucide-react';
import {
  useAppStore,
  PORTFOLIO_THEMES,
  PORTFOLIO_THEME_LIST,
} from '@/store/useAppStore';
import { PROFILE_DATA } from '@/data/portfolioData';
import { soundEngine } from '@/utils/soundEngine';
import { ResumeModal } from '@/components/modals/ResumeModal';

// Heavier modal (52-week heatmap + telemetry) is fetched only when first opened.
const ConsistencyModal = lazy(() =>
  import('@/components/modals/ConsistencyModal').then((m) => ({
    default: m.ConsistencyModal,
  }))
);

interface FixedFrameProps {
  replayTrigger: number;
  onReplayIntro: () => void;
}

export function FixedFrame({ replayTrigger, onReplayIntro }: FixedFrameProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const setColorTheme = useAppStore((s) => s.setColorTheme);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const isHeroOpen = useAppStore((s) => s.isHeroOpen);
  const setHeroOpen = useAppStore((s) => s.setHeroOpen);
  const setTransitioning = useAppStore((s) => s.setTransitioning);
  const isMobile = useAppStore((s) => s.isMobile);

  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isConsistencyOpen, setIsConsistencyOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const loaderPctRef = useRef<HTMLSpanElement>(null);
  const loaderStatusRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef<string>(location.pathname);
  const frameRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);

  const activeThemeConfig =
    PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const isHomeRoute = location.pathname === '/';
  const isDarkRoute =
    location.pathname === '/work' || location.pathname === '/about';
  const showBackArrow = !isHomeRoute || isHeroOpen;

  // Surface-aware typography colors (eliminates mix-blend-mode: difference hue inversion)
  const isTopLeftOnDark = isDarkRoute || (isHomeRoute && isHeroOpen);
  const isTopRightOnDark =
    isDarkRoute || (isHomeRoute && isHeroOpen && isMobile);
  const isBottomLeftOnDark =
    isDarkRoute || (isHomeRoute && isHeroOpen && !isMobile);

  const topLeftTextColor = isTopLeftOnDark
    ? activeThemeConfig.creamHex
    : activeThemeConfig.inkHex;
  const topRightTextColor = isTopRightOnDark
    ? activeThemeConfig.creamHex
    : activeThemeConfig.inkHex;
  const bottomLeftTextColor = isBottomLeftOnDark
    ? activeThemeConfig.creamHex
    : activeThemeConfig.inkHex;
  const bottomRightTextColor = activeThemeConfig.inkHex;

  // Sync ambient sound when soundEnabled toggles
  useEffect(() => {
    soundEngine.syncAmbient(soundEnabled);
  }, [soundEnabled]);

  // Ensure frame nav items are visible and hero flags reset when navigating between routes
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      gsap.set('.frame-nav-item', {
        opacity: 1,
        clearProps: 'transform',
      });
    }
    setTransitioning(false);
    setIsThemeMenuOpen(false);
    setIsRadialOpen(false);
    if (location.pathname !== '/') {
      setHeroOpen(false);
    }
  }, [location.pathname, setHeroOpen, setTransitioning]);

  // Close theme menu on Escape or outside click
  useEffect(() => {
    if (!isThemeMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeMenuOpen(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(target) &&
        themeBtnRef.current &&
        !themeBtnRef.current.contains(target)
      ) {
        setIsThemeMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isThemeMenuOpen]);

  // Run 2.8s 3D Parallax Startup Sequence + Center-to-Perimeter Dispersal Timeline
  useEffect(() => {
    const isInitial = replayTrigger === 0;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      const holdDuration = isInitial ? 2.75 : 0.25;

      // Hide perimeter items while loader is active so they never flash prematurely
      gsap.set(
        '.edge-top-left, .edge-top-nav, .edge-top-controls, .edge-top-right, .edge-left, .edge-right, .edge-bottom-left, .edge-bottom-right, .social-item',
        { opacity: 0 }
      );
      gsap.set('.social-line', { scaleY: 0, transformOrigin: 'bottom center' });

      // 1. 2.75-Second Architectural Split-Curtain & Asymmetric Prism Intro (Active on Initial Load)
      if (loaderRef.current && isInitial) {
        const counter = { val: 0 };
        const holdDuration = 2.65;

        gsap.set(loaderRef.current, {
          autoAlpha: 1,
          pointerEvents: 'auto',
        });
        gsap.set('.loader-curtain-left', { xPercent: 0 });
        gsap.set('.loader-curtain-right', { xPercent: 0 });

        // Draw center laser seam & fade in giant watermarks + asymmetric prism card
        tl.fromTo(
          '.loader-center-seam',
          { scaleY: 0, opacity: 1, transformOrigin: 'top center' },
          { scaleY: 1, duration: 0.7, ease: 'expo.inOut' },
          0
        )
          .fromTo(
            '.loader-watermark',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out' },
            0.08
          )
          .fromTo(
            '.loader-prism-card',
            { scale: 0.9, opacity: 0, y: 24 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.78,
              ease: 'power3.out',
            },
            0.12
          )
          .fromTo(
            '.loader-stage-pill',
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power3.out',
            },
            0.32
          );

        // Rotate the geodesic wireframe emblem while loading
        tl.fromTo(
          '.loader-geo-svg',
          { rotate: -45, scale: 0.85 },
          {
            rotate: 180,
            scale: 1,
            duration: holdDuration,
            ease: 'power2.inOut',
          },
          0
        );

        if (loaderBarRef.current) {
          gsap.set(loaderBarRef.current, { scaleX: 0 });
          tl.to(
            loaderBarRef.current,
            { scaleX: 1, duration: holdDuration, ease: 'power2.inOut' },
            0
          );
        }

        tl.to(
          counter,
          {
            val: 100,
            duration: holdDuration,
            ease: 'power2.inOut',
            onUpdate: () => {
              const pct = Math.round(counter.val);
              if (loaderPctRef.current) {
                loaderPctRef.current.textContent = `${String(pct).padStart(
                  2,
                  '0'
                )}%`;
              }
              if (loaderStatusRef.current) {
                if (pct < 26) {
                  loaderStatusRef.current.textContent =
                    '01 // GEODESIC WIREFRAME CORE';
                } else if (pct < 54) {
                  loaderStatusRef.current.textContent =
                    '02 // ASYMMETRIC 3D ARCHITECTURE';
                } else if (pct < 84) {
                  loaderStatusRef.current.textContent =
                    '03 // PROJECTS & CONSISTENCY MATRIX';
                } else {
                  loaderStatusRef.current.textContent =
                    '04 // OPENING SPLIT CURTAINS...';
                }
              }
            },
          },
          0
        )
          // Fold the asymmetric prism card into the 3D Core and part the Left/Right 50vw curtains!
          .to(
            '.loader-prism-card, .loader-stage-pill, .loader-center-seam',
            {
              scale: 0.78,
              opacity: 0,
              y: -14,
              duration: 0.42,
              stagger: 0.03,
              ease: 'power3.in',
            },
            holdDuration - 0.12
          )
          .to(
            '.loader-curtain-left',
            {
              xPercent: -102,
              duration: 0.92,
              ease: 'expo.inOut',
            },
            holdDuration
          )
          .to(
            '.loader-curtain-right',
            {
              xPercent: 102,
              duration: 0.92,
              ease: 'expo.inOut',
              onComplete: () => {
                if (loaderRef.current) {
                  gsap.set(loaderRef.current, {
                    autoAlpha: 0,
                    pointerEvents: 'none',
                  });
                }
              },
            },
            holdDuration
          );
      } else if (loaderRef.current) {
        gsap.set(loaderRef.current, { autoAlpha: 0, pointerEvents: 'none' });
      }

      // 2. Subtle Flash Pulse when Replay is triggered
      if (flashRef.current && !isInitial) {
        tl.fromTo(
          flashRef.current,
          { opacity: 0.85 },
          { opacity: 0, duration: 0.5, ease: 'power2.out' },
          holdDuration
        );
      }

      // 3. Center-to-Perimeter Parallax Dispersal ("Everything Goes to Its Place" as curtains part)
      const disperseStart = isInitial ? 2.82 : holdDuration + 0.05;

      tl.fromTo(
        '.edge-top-left',
        { x: '36vw', y: '38vh', scale: 1.35, opacity: 0 },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.15,
          immediateRender: false,
          clearProps: 'transform',
        },
        disperseStart
      )
        .fromTo(
          '.edge-top-nav',
          { x: '16vw', y: '38vh', scale: 1.2, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.15,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.04
        )
        .fromTo(
          '.edge-top-controls',
          { x: '-16vw', y: '38vh', scale: 1.2, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.15,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.06
        )
        .fromTo(
          '.edge-top-right',
          { x: '-36vw', y: '38vh', scale: 1.3, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.15,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.08
        )
        .fromTo(
          '.edge-left',
          { x: '42vw', y: '12vh', scale: 1.3, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.18,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.06
        )
        .fromTo(
          '.edge-right',
          { x: '-42vw', y: '0vh', scale: 1.3, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.18,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.08
        )
        .fromTo(
          '.edge-bottom-left',
          { x: '16vw', y: '-38vh', scale: 1.3, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.2,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.1
        )
        .fromTo(
          '.edge-bottom-right',
          { x: '-16vw', y: '-38vh', scale: 1.3, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.2,
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.12
        )
        .fromTo(
          '.social-item',
          { x: '34vw', y: '-22vh', scale: 0, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            stagger: 0.075,
            ease: 'back.out(1.5)',
            immediateRender: false,
            clearProps: 'transform',
          },
          disperseStart + 0.15
        )
        .fromTo(
          '.social-line',
          { scaleY: 0, transformOrigin: 'bottom center' },
          { scaleY: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: false },
          disperseStart + 0.34
        );
    }, rootRef);

    return () => ctx.revert();
  }, [replayTrigger]);

  // Shallow 3D perspective shift for edge labels & monogram driven by cursor
  const labelShiftStyle = (depthFactor = 1) => ({
    transform: `perspective(600px) translate3d(${(
      dampedPointer.x *
      5 *
      depthFactor
    ).toFixed(2)}px, ${(-dampedPointer.y * 5 * depthFactor).toFixed(
      2
    )}px, 0px) rotateY(${(dampedPointer.x * 6 * depthFactor).toFixed(
      2
    )}deg) rotateX(${(dampedPointer.y * 6 * depthFactor).toFixed(2)}deg)`,
  });

  const handleBackClick = () => {
    soundEngine.playClick();
    if (!isHomeRoute) {
      navigate('/');
    }
    setTransitioning(false);
    setHeroOpen(false);
    onReplayIntro();
  };

  const socialLinks = [
    {
      label: 'LinkedIn',
      href: PROFILE_DATA.socials.linkedin,
      icon: Linkedin,
    },
    {
      label: 'GitHub',
      href: PROFILE_DATA.socials.github,
      icon: Github,
    },
    {
      label: 'LeetCode (1,316)',
      href: PROFILE_DATA.socials.leetcode,
      icon: Code2,
    },
    {
      label: 'Codeforces',
      href: PROFILE_DATA.socials.codeforces,
      icon: Terminal,
    },
    {
      label: 'AtCoder',
      href: PROFILE_DATA.socials.atcoder,
      icon: Trophy,
    },
  ];

  const radialNavItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/' && !isHeroOpen,
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        if (!isHomeRoute) {
          navigate('/');
        }
        setTransitioning(false);
        setHeroOpen(false);
        onReplayIntro();
      },
    },
    {
      label: 'Projects',
      path: '/work',
      icon: Layers,
      isActive: location.pathname === '/work',
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        navigate('/work');
      },
    },
    {
      label: 'About',
      path: '/about',
      icon: User,
      isActive: location.pathname === '/about',
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        navigate('/about');
      },
    },
    {
      label: 'My Skills',
      path: '/skills',
      icon: Cpu,
      isActive: location.pathname === '/skills',
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        navigate('/skills');
      },
    },
    {
      label: 'Feats',
      path: '/feats',
      icon: Award,
      isActive: location.pathname === '/feats',
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        navigate('/feats');
      },
    },
    {
      label: 'Resume PDF',
      path: '#resume',
      icon: FileText,
      isActive: isResumeOpen,
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        setIsResumeOpen(true);
      },
    },
    {
      label: 'Consistency Chart',
      path: '#consistency',
      icon: Activity,
      isActive: isConsistencyOpen,
      onClick: () => {
        soundEngine.playClick();
        setIsRadialOpen(false);
        setIsConsistencyOpen(true);
      },
    },
  ];

  return (
    <div ref={rootRef}>
      {/* =====================================================================
          ARCHITECTURAL SPLIT-CURTAIN & ASYMMETRIC PRISM INTRO (2.8s Boot + Parting Reveal)
          Matches the portfolio's 50/50 split curtains, rounded-[0_20%_0_20%] cards,
          giant watermarks, and 3D Geodesic Wireframe Core.
         ===================================================================== */}
      <div
        ref={loaderRef}
        className="fixed inset-0 z-[65] flex flex-col items-center justify-center select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* LEFT 50VW ARCHITECTURAL CURTAIN (Solid Black/Ink with White SUJAY + Grid & Text Mouse Parallax) */}
        <div
          style={{
            backgroundColor: activeThemeConfig.inkHex,
            backgroundImage: `linear-gradient(to right, rgb(${activeThemeConfig.creamRgb} / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(${activeThemeConfig.creamRgb} / 0.05) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            backgroundPosition: `${(dampedPointer.x * 18).toFixed(1)}px ${(-dampedPointer.y * 18).toFixed(1)}px`,
          }}
          className="loader-curtain-left absolute left-0 top-0 w-1/2 h-full overflow-hidden"
        >
          <div
            style={{
              ...labelShiftStyle(1.35),
              color: activeThemeConfig.creamHex,
            }}
            className="loader-watermark absolute top-[6.5vh] left-[5vw] font-sans font-light text-[clamp(3.8rem,9.8vw,10.5rem)] leading-none tracking-[0.12em] opacity-95 pointer-events-none"
          >
            SUJAY
          </div>

          <div
            style={{
              ...labelShiftStyle(0.6),
              color: `rgb(${activeThemeConfig.creamRgb} / 0.65)`,
            }}
            className="absolute bottom-[4vh] left-[4vw] font-mono text-[10px] sm:text-xs tracking-[0.22em] uppercase"
          >
            SP // PORTFOLIO ARCHITECTURE
          </div>
        </div>

        {/* RIGHT 50VW ARCHITECTURAL CURTAIN (Solid Crisp White/Cream with Black PAUL + Grid & Text Mouse Parallax) */}
        <div
          style={{
            backgroundColor: activeThemeConfig.creamHex,
            backgroundImage: `linear-gradient(to right, rgb(${activeThemeConfig.inkRgb} / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(${activeThemeConfig.inkRgb} / 0.05) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            backgroundPosition: `${(-dampedPointer.x * 18).toFixed(1)}px ${(dampedPointer.y * 18).toFixed(1)}px`,
          }}
          className="loader-curtain-right absolute right-0 top-0 w-1/2 h-full overflow-hidden"
        >
          <div
            style={{
              ...labelShiftStyle(-1.35),
              color: activeThemeConfig.inkHex,
            }}
            className="loader-watermark absolute top-[6.5vh] right-[5vw] font-sans font-light text-[clamp(3.8rem,9.8vw,10.5rem)] leading-none tracking-[0.12em] opacity-95 pointer-events-none"
          >
            PAUL
          </div>

          <div
            style={{
              ...labelShiftStyle(-0.6),
              color: `rgb(${activeThemeConfig.inkRgb} / 0.65)`,
            }}
            className="absolute bottom-[4vh] right-[4vw] font-mono text-[10px] sm:text-xs tracking-[0.22em] uppercase text-right"
          >
            CHENNAI, IN • EDITION 2026
          </div>
        </div>

        {/* CENTER 50VW VERTICAL SEAM LINE */}
        <div
          style={{ backgroundColor: activeThemeConfig.inkHex }}
          className="loader-center-seam absolute left-1/2 top-0 -translate-x-1/2 w-[1.5px] h-full opacity-20 pointer-events-none"
        />

        {/* CENTERPIECE: STATIONARY SOLID ARCHITECTURAL PRISM CARD (Larger, Clean Opaque Surface, No Background Bleed) */}
        <div className="relative z-10 flex flex-col items-center px-4 translate-y-[2vh] sm:translate-y-[2.5vh]">
          <div
            style={{
              backgroundColor: activeThemeConfig.creamHex,
              color: activeThemeConfig.inkHex,
              borderColor: activeThemeConfig.inkHex,
              boxShadow: `0 28px 70px rgba(0,0,0,0.42), 0 0 0 1px rgb(${activeThemeConfig.creamRgb} / 0.25)`,
            }}
            className="loader-prism-card w-[clamp(310px,84vw,430px)] rounded-[0_20%_0_20%] border-2 p-6 sm:p-8 flex flex-col justify-between gap-5"
          >
            {/* Card Header Strip */}
            <div
              style={{ borderColor: `rgb(${activeThemeConfig.inkRgb} / 0.16)` }}
              className="flex items-center justify-between border-b pb-3"
            >
              <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase opacity-75">
                00 // INITIALIZING
              </span>
              <span
                style={{
                  borderColor: activeThemeConfig.inkHex,
                  backgroundColor: `rgb(${activeThemeConfig.panelRgb} / 0.12)`,
                }}
                className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 border"
              >
                {PROFILE_DATA.monogram}
              </span>
            </div>

            {/* Center Geodesic Wireframe SVG + Editorial Name */}
            <div className="py-2 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-4">
                {/* Outer Orbital Ring */}
                <div
                  style={{ borderColor: `rgb(${activeThemeConfig.inkRgb} / 0.28)` }}
                  className="absolute inset-0 rounded-full border border-dashed animate-spin"
                />
                {/* Geodesic Wireframe Polyhedron SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="loader-geo-svg w-20 h-20 sm:w-24 sm:h-24"
                  fill="none"
                  stroke={activeThemeConfig.inkHex}
                  strokeWidth="1.6"
                >
                  <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" />
                  <polygon
                    points="50,18 80,68 20,68"
                    stroke={activeThemeConfig.panelHex}
                  />
                  <polygon
                    points="50,82 80,32 20,32"
                    stroke={activeThemeConfig.panelHex}
                  />
                  <line x1="50" y1="6" x2="50" y2="94" strokeOpacity="0.45" />
                  <line x1="10" y1="28" x2="90" y2="72" strokeOpacity="0.45" />
                  <line x1="90" y1="28" x2="10" y2="72" strokeOpacity="0.45" />
                  <circle
                    cx="50"
                    cy="50"
                    r="5"
                    fill={activeThemeConfig.accentHex}
                    stroke="none"
                  />
                </svg>
              </div>

              <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                {PROFILE_DATA.name}
              </h2>

              <div
                style={{ backgroundColor: activeThemeConfig.panelHex }}
                className="w-10 h-[1.5px] my-2.5"
              />

              <p className="font-mono italic text-[11px] sm:text-xs opacity-85">
                Java Backend • Full-Stack • Applied AI
              </p>
            </div>

            {/* Bottom Progress Bar & Large Editorial Percentage Counter */}
            <div
              style={{ borderColor: `rgb(${activeThemeConfig.inkRgb} / 0.16)` }}
              className="pt-3 border-t space-y-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  ref={loaderStatusRef}
                  className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80 truncate"
                >
                  01 // GEODESIC WIREFRAME CORE
                </span>
                <span
                  ref={loaderPctRef}
                  className="font-display text-sm sm:text-base font-bold tracking-wider shrink-0"
                >
                  00%
                </span>
              </div>

              <div
                style={{
                  backgroundColor: `rgb(${activeThemeConfig.inkRgb} / 0.14)`,
                }}
                className="w-full h-[4px] overflow-hidden"
              >
                <div
                  ref={loaderBarRef}
                  style={{ backgroundColor: activeThemeConfig.inkHex }}
                  className="w-full h-full origin-left scale-x-0"
                />
              </div>
            </div>
          </div>

          {/* 4 Architectural Section Pillars Below Card */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[
              '01 // PROJECTS',
              '02 // ABOUT',
              '03 // SKILLS',
              '04 // FEATS',
            ].map((pill) => (
              <span
                key={pill}
                style={{
                  borderColor: `rgb(${activeThemeConfig.creamRgb} / 0.35)`,
                  backgroundColor: `rgb(${activeThemeConfig.inkRgb} / 0.78)`,
                  color: activeThemeConfig.creamHex,
                }}
                className="loader-stage-pill rounded-[0_18%_0_18%] px-2.5 py-0.5 border font-mono text-[9px] sm:text-[10px] tracking-widest uppercase"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* White Flash Intro Overlay */}
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[60] opacity-0"
      />

      {/* Fixed Frame Overlay with surface-aware theme typography & accent highlights */}
      <div
        ref={frameRef}
        className="fixed inset-0 pointer-events-none z-50 select-none"
      >
        {/* 1. TOP-LEFT: Futuristic Monogram SP // TECH */}
        <div
          style={{ color: topLeftTextColor }}
          className="frame-nav-item edge-top edge-top-left absolute top-[2.4vh] left-[2.2vw] pointer-events-auto transition-colors duration-300"
        >
          <Link
            to="/"
            onClick={() => {
              soundEngine.playClick();
              if (isHeroOpen || !isHomeRoute) {
                setTransitioning(false);
                setHeroOpen(false);
                onReplayIntro();
              }
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(1.3),
              textShadow:
                theme === 'dark' || colorTheme !== 'classic'
                  ? `${-dampedPointer.x * 5}px ${
                      dampedPointer.y * 5
                    }px 14px rgb(${activeThemeConfig.accentRgb} / 0.48)`
                  : 'none',
            }}
            className="inline-block font-display text-[11px] sm:text-base md:text-lg tracking-[0.14em] sm:tracking-[0.22em] font-bold transition-transform duration-150 hover:scale-105"
          >
            {PROFILE_DATA.monogram}
          </Link>
        </div>

        {/* 2. TOP EDGE LABELS: Resume + Consistency Chart (Side-by-side next to Resume) */}
        <div
          style={{ color: topLeftTextColor }}
          className="frame-nav-item edge-top edge-top-nav absolute top-[2.4vh] sm:top-[2.5vh] left-[20vw] sm:left-[17.5vw] md:left-[16.5vw] flex items-center gap-2.5 sm:gap-4 md:gap-5 pointer-events-auto transition-colors duration-300"
        >
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsResumeOpen(true);
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(0.9),
              textDecorationColor: activeThemeConfig.accentHex,
            }}
            className="font-sans text-xs sm:text-base md:text-[1.08rem] font-medium tracking-wider hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
          >
            Resume
          </button>

          <span
            style={{ color: activeThemeConfig.accentHex }}
            className="opacity-85 font-mono text-xs font-bold select-none"
            aria-hidden="true"
          >
            /
          </span>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsConsistencyOpen(true);
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(0.9),
              textDecorationColor: activeThemeConfig.accentHex,
            }}
            title="View 52-Week GitHub & LeetCode Consistency Chart"
            className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-base md:text-[1.08rem] font-medium tracking-wider hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
          >
            <Activity
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              style={{ color: activeThemeConfig.accentHex }}
            />
            <span className="hidden md:inline">Consistency Chart</span>
            <span className="md:hidden">Consistency</span>
          </button>
        </div>

        {/* 3. TOP-CENTRE: Circular Back Arrow (Hidden on initial Home screen; visible on Hero & all sub-routes) */}
        <div className="frame-nav-item edge-top absolute top-[2.1vh] left-[50%] sm:left-1/2 -translate-x-1/2 pointer-events-auto">
          {showBackArrow && (
            <button
              type="button"
              onClick={handleBackClick}
              onMouseEnter={() => soundEngine.playHoverTick()}
              aria-label="Return to Home Screen"
              style={{
                backgroundColor: activeThemeConfig.inkHex,
                color: activeThemeConfig.creamHex,
                borderColor: activeThemeConfig.accentHex,
                boxShadow: `0 4px 16px rgba(0,0,0,0.28)`,
              }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center hover:!bg-panel transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* TOP-CENTRE-RIGHT: [Theme Tab] + [Glow: Dark/Light] + [SFX On/Muted] */}
        <div
          style={{ color: topRightTextColor }}
          className="frame-nav-item edge-top edge-top-controls absolute top-[2.2vh] sm:top-[2.3vh] right-[16.5vw] sm:right-[10.8vw] flex items-center gap-1 sm:gap-2 pointer-events-auto transition-colors duration-300"
        >
          {/* NEW: Portfolio Color Theme Selector Tab (Placed right before Glow option) */}
          <button
            ref={themeBtnRef}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsThemeMenuOpen((prev) => !prev);
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            aria-label={`Theme: ${activeThemeConfig.shortName}`}
            aria-expanded={isThemeMenuOpen}
            title={`Portfolio Theme: ${activeThemeConfig.name}`}
            style={{
              borderColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.creamRgb} / 0.75)`
                : `rgb(${activeThemeConfig.inkRgb} / 0.75)`,
              backgroundColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.inkRgb} / 0.65)`
                : `rgb(${activeThemeConfig.creamRgb} / 0.78)`,
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2.5 border backdrop-blur-sm flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:!bg-panel hover:!text-cream transition-colors"
          >
            <Palette
              className="w-3.5 h-3.5"
              style={{ color: activeThemeConfig.accentHex }}
            />
            <span className="hidden md:inline">
              Theme: {activeThemeConfig.shortName}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                isThemeMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Existing Glow: Dark / Light Toggle (Kept intact) */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              soundEngine.playClick();
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            aria-label={theme === 'dark' ? 'Glow: Dark' : 'Glow: Light'}
            title={`Scene Lighting: ${theme.toUpperCase()}`}
            style={{
              borderColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.creamRgb} / 0.75)`
                : `rgb(${activeThemeConfig.inkRgb} / 0.75)`,
              backgroundColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.inkRgb} / 0.65)`
                : `rgb(${activeThemeConfig.creamRgb} / 0.78)`,
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2.5 border backdrop-blur-sm flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:!bg-panel hover:!text-cream transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Moon
                  className="w-3.5 h-3.5"
                  style={{ color: activeThemeConfig.accentHex }}
                />
                <span className="hidden md:inline">Glow: Dark</span>
              </>
            ) : (
              <>
                <Sun
                  className="w-3.5 h-3.5"
                  style={{ color: activeThemeConfig.accentHex }}
                />
                <span className="hidden md:inline">Glow: Light</span>
              </>
            )}
          </button>

          {/* Existing SFX On / Muted Toggle (Kept intact) */}
          <button
            type="button"
            onClick={() => {
              toggleSound();
              soundEngine.playClick();
            }}
            onMouseEnter={() => soundEngine.playHoverTick()}
            aria-label={soundEnabled ? 'SFX On' : 'Muted'}
            title={soundEnabled ? 'Audio On' : 'Audio Muted'}
            style={{
              borderColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.creamRgb} / 0.75)`
                : `rgb(${activeThemeConfig.inkRgb} / 0.75)`,
              backgroundColor: isTopRightOnDark
                ? `rgb(${activeThemeConfig.inkRgb} / 0.65)`
                : `rgb(${activeThemeConfig.creamRgb} / 0.78)`,
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2.5 border backdrop-blur-sm flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:!bg-panel hover:!text-cream transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2
                  className="w-3.5 h-3.5"
                  style={{ color: activeThemeConfig.accentHex }}
                />
                <span className="hidden lg:inline">SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-75" />
                <span className="hidden lg:inline opacity-80">Muted</span>
              </>
            )}
          </button>
        </div>

        {/* 4. TOP-RIGHT EDGE LABEL: Say hi.. (mailto) */}
        <div
          style={{ color: topRightTextColor }}
          className="frame-nav-item edge-top edge-top-right absolute top-[2.6vh] right-[2.2vw] pointer-events-auto transition-colors duration-300"
        >
          <a
            href={PROFILE_DATA.socials.email}
            onClick={() => soundEngine.playClick()}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(0.95),
              textDecorationColor: activeThemeConfig.accentHex,
            }}
            className="inline-block font-sans text-xs sm:text-base md:text-[1.08rem] font-medium tracking-wider hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
          >
            Say hi..
          </a>
        </div>

        {/* 5. LEFT EDGE LABEL: Projects (rotated -90 deg) */}
        <div
          style={{ color: topLeftTextColor }}
          className="frame-nav-item edge-left absolute left-[1.8vw] top-[34%] -translate-y-1/2 pointer-events-auto transition-colors duration-300"
        >
          <Link
            to="/work"
            onClick={() => soundEngine.playClick()}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(1.0),
              textDecorationColor: activeThemeConfig.accentHex,
            }}
            className="inline-block -rotate-90 origin-center font-sans text-xs sm:text-base md:text-[1.1rem] font-medium tracking-widest hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
          >
            Projects
          </Link>
        </div>

        {/* 6. RIGHT EDGE LABEL: Feats (rotated +90 deg) */}
        <div
          style={{ color: topRightTextColor }}
          className="frame-nav-item edge-right absolute right-[1.8vw] top-[34%] md:top-1/2 -translate-y-1/2 pointer-events-auto transition-colors duration-300"
        >
          <Link
            to="/feats"
            onClick={() => soundEngine.playClick()}
            onMouseEnter={() => soundEngine.playHoverTick()}
            style={{
              ...labelShiftStyle(1.0),
              textDecorationColor: activeThemeConfig.accentHex,
            }}
            className="inline-block rotate-90 origin-center font-sans text-xs sm:text-base md:text-[1.1rem] font-medium tracking-widest hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
          >
            Feats
          </Link>
        </div>

        {/* 7 & 8. BOTTOM EDGE LABELS: About & My Skills (Exact position, visible on Home Screen so sub-sections never look suffocated) */}
        {isHomeRoute && (
          <>
            <div
              style={{ color: bottomLeftTextColor }}
              className="frame-nav-item edge-bottom edge-bottom-left absolute bottom-[2.4vh] left-[32%] -translate-x-1/2 pointer-events-auto transition-colors duration-300"
            >
              <Link
                to="/about"
                onClick={() => soundEngine.playClick()}
                onMouseEnter={() => soundEngine.playHoverTick()}
                style={{
                  ...labelShiftStyle(0.95),
                  textDecorationColor: activeThemeConfig.accentHex,
                }}
                className="inline-block font-sans text-xs sm:text-base md:text-[1.1rem] font-medium tracking-wider hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
              >
                About
              </Link>
            </div>

            <div
              style={{ color: bottomRightTextColor }}
              className="frame-nav-item edge-bottom edge-bottom-right absolute bottom-[2.4vh] left-[68%] -translate-x-1/2 pointer-events-auto transition-colors duration-300"
            >
              <Link
                to="/skills"
                onClick={() => soundEngine.playClick()}
                onMouseEnter={() => soundEngine.playHoverTick()}
                style={{
                  ...labelShiftStyle(0.95),
                  textDecorationColor: activeThemeConfig.accentHex,
                }}
                className="inline-block font-sans text-xs sm:text-base md:text-[1.1rem] font-medium tracking-wider hover:underline decoration-2 underline-offset-4 transition-transform duration-150 hover:scale-105"
              >
                My Skills
              </Link>
            </div>
          </>
        )}

        {/* 9. BOTTOM-LEFT SOCIAL RAIL + LOOPING SCALE WAVE + 1PX VERTICAL LINE */}
        <div
          style={{ color: bottomLeftTextColor }}
          className="frame-nav-item absolute left-[2.1vw] bottom-0 flex flex-col items-center gap-3 sm:gap-3.5 pointer-events-auto transition-colors duration-300"
        >
          <ul className="flex flex-col items-center gap-3 sm:gap-3.5">
            {socialLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="social-item social-wave-item"
                  style={{ animationDelay: `${index * 0.25}s` }}
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    onClick={() => soundEngine.playClick()}
                    onMouseEnter={() => soundEngine.playHoverTick()}
                    className="block p-1 hover:scale-125 transition-transform"
                  >
                    <Icon className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]" />
                  </a>
                </li>
              );
            })}
          </ul>
          <div
            style={{ backgroundColor: bottomLeftTextColor }}
            className="social-line w-[1.5px] h-[75px] sm:h-[115px] transition-colors duration-300"
          />
        </div>
      </div>

      {/* =====================================================================
          MOBILE & TABLET RADIAL QUICK-NAVIGATION DOCK (< 1024px)
          Rendered outside mix-blend-mode for true theme colors & thumb ergonomics
         ===================================================================== */}
      <div className="lg:hidden fixed bottom-[2vh] right-[2.8vw] z-[70] select-none flex flex-col items-end">
        {isRadialOpen && (
          <div
            style={{
              backgroundColor: activeThemeConfig.inkHex,
              borderColor: activeThemeConfig.accentHex,
              color: activeThemeConfig.creamHex,
              boxShadow: `0 16px 40px rgba(0,0,0,0.72), 0 0 22px rgb(${activeThemeConfig.accentRgb} / 0.28)`,
            }}
            className="mb-2.5 w-[210px] border-2 p-2 space-y-1.5"
          >
            <div
              style={{
                borderColor: `rgb(${activeThemeConfig.creamRgb} / 0.25)`,
                color: activeThemeConfig.accentSoftHex,
              }}
              className="px-2.5 py-1 border-b font-mono text-[10px] font-bold uppercase tracking-widest flex items-center justify-between"
            >
              <span>QUICK NAV // RADIAL</span>
              <span>SP</span>
            </div>

            {radialNavItems.map((nav) => {
              const NavIcon = nav.icon;
              return (
                <button
                  key={nav.label}
                  type="button"
                  onClick={nav.onClick}
                  style={
                    nav.isActive
                      ? {
                          backgroundColor: activeThemeConfig.creamHex,
                          color: activeThemeConfig.inkHex,
                          borderColor: activeThemeConfig.creamHex,
                        }
                      : {
                          backgroundColor: `rgb(${activeThemeConfig.panelRgb} / 0.32)`,
                          color: activeThemeConfig.creamHex,
                          borderColor: `rgb(${activeThemeConfig.creamRgb} / 0.35)`,
                        }
                  }
                  className="w-full px-3 py-2 border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-transform active:scale-95"
                >
                  <span className="inline-flex items-center gap-2">
                    <NavIcon className="w-3.5 h-3.5" />
                    <span>{nav.label}</span>
                  </span>
                  {nav.isActive && (
                    <span className="text-[9px] tracking-widest">●</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsRadialOpen((prev) => !prev);
          }}
          aria-label={isRadialOpen ? 'Close navigation menu' : 'Nav menu'}
          aria-expanded={isRadialOpen}
          style={{
            backgroundColor: isRadialOpen
              ? activeThemeConfig.creamHex
              : activeThemeConfig.inkHex,
            color: isRadialOpen
              ? activeThemeConfig.inkHex
              : activeThemeConfig.creamHex,
            borderColor: activeThemeConfig.accentHex,
            boxShadow: `0 6px 22px rgba(0,0,0,0.55)`,
          }}
          className="h-9 px-3 border-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95"
        >
          {isRadialOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Compass
                className="w-3.5 h-3.5"
                style={{ color: activeThemeConfig.accentHex }}
              />
              <span>Nav</span>
            </>
          )}
        </button>
      </div>

      {/* =====================================================================
          5-THEME SELECTOR POPOVER (Rendered outside mix-blend-mode for true colors)
         ===================================================================== */}
      {isThemeMenuOpen && (
        <div
          ref={themeMenuRef}
          className="fixed top-[6.8vh] right-[4vw] sm:right-[10.8vw] z-[75] w-[295px] sm:w-[345px] bg-black text-cream border-2 border-cream shadow-[0_18px_50px_rgba(0,0,0,0.65)] select-none"
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-cream/30 flex items-center justify-between bg-panel/40">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cream">
              PORTFOLIO THEME // 5 MODES
            </span>
            <span className="font-mono text-[10px] text-cream/75">
              GLOBAL PALETTE
            </span>
          </div>

          {/* 5 Theme Options */}
          <div className="p-2 space-y-1.5">
            {PORTFOLIO_THEME_LIST.map((item) => {
              const isSelected = item.id === colorTheme;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setColorTheme(item.id);
                    setIsThemeMenuOpen(false);
                  }}
                  onMouseEnter={() => soundEngine.playHoverTick()}
                  className={`w-full text-left px-3 py-2.5 border transition-all duration-150 flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cream text-black border-cream'
                      : 'bg-black text-cream border-cream/30 hover:bg-panel hover:border-cream'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Live 3-Color Swatch Pill (Light Surface, Dark Ink, 3D Glow Accent) */}
                    <div
                      className="shrink-0 flex items-center p-1 border"
                      style={{
                        backgroundColor: item.inkHex,
                        borderColor: item.creamHex,
                      }}
                    >
                      <span
                        className="w-3 h-3 block"
                        style={{ backgroundColor: item.creamHex }}
                        title="Primary Light Surface"
                      />
                      <span
                        className="w-3 h-3 block"
                        style={{ backgroundColor: item.panelHex }}
                        title="Hover / Curtain Surface"
                      />
                      <span
                        className="w-3 h-3 block"
                        style={{ backgroundColor: item.accentHex }}
                        title="3D Core & Starlight Accent"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-sans font-bold text-xs sm:text-sm leading-tight truncate">
                        {item.name}
                      </div>
                      <div
                        className={`font-mono text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-black/75' : 'text-cream/75'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-black text-cream font-mono text-[9px] uppercase tracking-wider">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resume PDF Preview Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      {/* 52-Week GitHub & LeetCode Consistency Chart Modal (lazy chunk) */}
      {isConsistencyOpen && (
        <Suspense fallback={null}>
          <ConsistencyModal
            isOpen={isConsistencyOpen}
            onClose={() => setIsConsistencyOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
