import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Github,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Code2,
  Sparkles,
} from 'lucide-react';
import { PROJECTS_DATA, PROFILE_DATA, ProjectItem } from '@/data/portfolioData';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Phase 5: Work Screen (/work)
 * - Entry transition: White flash -> grey overlay (#41413e) fades into pitch-black (#000000) while cards stagger in.
 * - Curved 3D card track with drag, mouse wheel, trackpad horizontal scroll, keyboard arrows, inertia damping, and velocity skew.
 * - 8 featured project cards + 9th panoramic archive card ("Full-stack / backend / AI case studies and GitHub projects").
 * - Asymmetric corner shape (`border-radius: 0 20% 0 20%`) on both front (Cream #fbf4f3) and back (Black #000000 with 1px cream outline).
 * - Hover / Tap 3D flip (`rotateY(180deg)`) revealing project image, 1px white horizontal rule, hashtags, cream Visit button & GitHub icon.
 */
export function WorkScreen() {
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  // Track which card IDs are currently flipped (supports both hover and tap/click toggle)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [pinnedCardId, setPinnedCardId] = useState<string | null>(null);
  const [activeCardIdx, setActiveCardIdx] = useState<number>(1);

  const screenRef = useRef<HTMLDivElement>(null);
  const greyCurtainRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const trackViewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Physics / Inertia state refs (mutated in 60fps RAF loop without re-renders)
  const scrollState = useRef({
    target: 0,
    current: 0,
    maxScroll: 2400,
    isDragging: false,
    dragStartX: 0,
    dragStartTarget: 0,
    dragMovedDistance: 0,
  });

  // Measure track bounds whenever window resizes or cards mount
  const updateBounds = useCallback(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const totalTrackWidth = trackEl.scrollWidth;
    const viewportWidth = window.innerWidth;
    const max = Math.max(0, totalTrackWidth - viewportWidth);
    scrollState.current.maxScroll = max;
    scrollState.current.target = Math.max(
      0,
      Math.min(max, scrollState.current.target)
    );
  }, []);

  // Entry choreography: White flash -> grey overlay (#41413e) fades to black while cards rise in
  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (whiteFlashRef.current) {
        tl.fromTo(
          whiteFlashRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.32, ease: 'power2.out' },
          0
        );
      }

      if (greyCurtainRef.current) {
        tl.fromTo(
          greyCurtainRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.65, ease: 'power3.inOut' },
          0.12
        );
      }

      tl.fromTo(
        '.work-card-entry',
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.065,
          ease: 'power3.out',
        },
        0.22
      );
    }, screenRef);

    return () => {
      window.removeEventListener('resize', updateBounds);
      ctx.revert();
    };
  }, [updateBounds]);

  // 60fps Inertia + 3D Cylindrical Arc + Velocity Skew RAF loop
  useEffect(() => {
    let rafId = 0;
    let lastReportedIdx = 1;

    const tick = () => {
      const state = scrollState.current;
      const { dampedPointer, prefersReducedMotion, setScrollVelocity } =
        useAppStore.getState();

      // Smooth inertia interpolation: cur += (target - cur) * 0.085
      const diff = state.target - state.current;
      state.current += diff * 0.085;
      const velocity = diff;

      setScrollVelocity(velocity);

      // Translate track horizontally
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-state.current.toFixed(2)}px, 0px, 0px)`;
      }

      // Update progress bar
      if (progressFillRef.current) {
        const progress =
          state.maxScroll > 0
            ? Math.max(0, Math.min(1, state.current / state.maxScroll))
            : 0;
        progressFillRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      // Apply 3D curved arc + velocity skew to each card slot
      const vw = window.innerWidth;
      const viewportCenter = vw * 0.5;
      let closestCardIdx = 1;
      let minDistance = Infinity;

      for (let i = 0; i < cardSlotRefs.current.length; i++) {
        const slotEl = cardSlotRefs.current[i];
        if (!slotEl) continue;

        const cardCenterOnScreen =
          slotEl.offsetLeft + slotEl.offsetWidth * 0.5 - state.current;
        const distFromCenter = cardCenterOnScreen - viewportCenter;

        if (Math.abs(distFromCenter) < minDistance) {
          minDistance = Math.abs(distFromCenter);
          closestCardIdx = i + 1;
        }

        if (prefersReducedMotion) {
          slotEl.style.transform = 'none';
          continue;
        }

        // Normalized horizontal offset (-1.4 to +1.4 across viewport)
        const norm = Math.max(-1.6, Math.min(1.6, distFromCenter / (vw * 0.62)));

        // Shallow 3D cylindrical curve + cursor tilt + velocity skew
        const arcZ = -Math.min(130, Math.pow(Math.abs(norm), 1.6) * 62);
        const arcY = Math.min(24, Math.pow(Math.abs(norm), 1.75) * 12);
        const arcRotY = -norm * 13.5 + dampedPointer.x * 5.5;
        const arcRotX = -dampedPointer.y * 4.5;
        const skewY = Math.max(-8.5, Math.min(8.5, velocity * -0.042));

        slotEl.style.transform = `perspective(1200px) translate3d(0px, ${arcY.toFixed(1)}px, ${arcZ.toFixed(1)}px) rotateY(${arcRotY.toFixed(2)}deg) rotateX(${arcRotX.toFixed(2)}deg) skewY(${skewY.toFixed(2)}deg)`;
      }

      if (closestCardIdx !== lastReportedIdx) {
        lastReportedIdx = closestCardIdx;
        setActiveCardIdx(closestCardIdx);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      useAppStore.getState().setScrollVelocity(0);
    };
  }, []);

  // Wheel & Trackpad listener (handles both vertical wheel deltaY and horizontal trackpad deltaX)
  useEffect(() => {
    const viewportEl = trackViewportRef.current;
    if (!viewportEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const primaryDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const state = scrollState.current;
      state.target = Math.max(
        0,
        Math.min(state.maxScroll, state.target + primaryDelta * 1.15)
      );
    };

    viewportEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewportEl.removeEventListener('wheel', handleWheel);
  }, []);

  // Keyboard Left/Right navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = scrollState.current;
      const step = Math.min(380, window.innerWidth * 0.25);
      if (e.key === 'ArrowRight') {
        state.target = Math.min(state.maxScroll, state.target + step);
      } else if (e.key === 'ArrowLeft') {
        state.target = Math.max(0, state.target - step);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Do not start drag if clicking a link or button directly
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('a, button')) return;

    const state = scrollState.current;
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartTarget = state.target;
    state.dragMovedDistance = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = scrollState.current;
    if (!state.isDragging) return;

    const dx = e.clientX - state.dragStartX;
    state.dragMovedDistance = Math.abs(dx);
    state.target = Math.max(
      0,
      Math.min(state.maxScroll, state.dragStartTarget - dx * 1.35)
    );
  };

  const handlePointerUp = () => {
    scrollState.current.isDragging = false;
  };

  const scrollByStep = (direction: -1 | 1) => {
    soundEngine.playClick();
    const state = scrollState.current;
    const step = Math.min(390, window.innerWidth * 0.26);
    state.target = Math.max(
      0,
      Math.min(state.maxScroll, state.target + direction * step)
    );
  };

  const scrollToCard = (index: number) => {
    soundEngine.playClick();
    const slotEl = cardSlotRefs.current[index];
    if (!slotEl) return;
    const state = scrollState.current;
    const desired =
      slotEl.offsetLeft + slotEl.offsetWidth * 0.5 - window.innerWidth * 0.5;
    state.target = Math.max(0, Math.min(state.maxScroll, desired));
  };

  const handleCardToggleFlip = (cardId: string) => {
    // Ignore if user was dragging the track
    if (scrollState.current.dragMovedDistance > 8) return;
    soundEngine.playClick();
    setPinnedCardId((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div ref={screenRef} className="relative w-full h-full overflow-hidden select-none">
      {/* Dynamic Theme Atmospheric Background at z-0 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          background: isCustomTheme
            ? `radial-gradient(circle at 50% 50%, rgb(${palette.panelRgb} / 0.5) 0%, rgb(${palette.inkRgb} / 0.96) 58%, ${palette.inkHex} 100%)`
            : palette.inkHex,
        }}
        aria-hidden="true"
      />

      {/* Entry Transition Overlays (White Flash -> Panel Curtain -> Black) */}
      <div
        ref={greyCurtainRef}
        className="fixed inset-0 bg-panel pointer-events-none z-40 opacity-0"
        aria-hidden="true"
      />
      <div
        ref={whiteFlashRef}
        className="fixed inset-0 bg-white pointer-events-none z-40 opacity-0"
        aria-hidden="true"
      />

      {/* Giant Faint Selectable Watermarks ("WORK" at top-centre-right, "Swipe." at bottom-right) */}
      <div className="watermark-text fixed top-[7vh] left-[18vw] sm:left-[28vw] z-10 select-text">
        WORK
      </div>
      <div className="watermark-text fixed bottom-[6.5vh] right-[7vw] z-10 select-text">
        Swipe.
      </div>

      {/* =====================================================================
          CURVED 3D HORIZONTAL CARD TRACK (z-20, above SharedCanvas)
         ===================================================================== */}
      <div
        ref={trackViewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative z-20 w-full h-full flex items-center cursor-grab active:cursor-grabbing touch-pan-y"
      >
        <div
          ref={trackRef}
          className="flex items-center gap-[clamp(28px,4.8vw,74px)] px-[14vw] sm:px-[20vw] md:px-[24vw] will-change-transform"
        >
          {/* 8 FEATURED PROJECT CARDS */}
          {PROJECTS_DATA.map((project, index) => {
            const isFlipped =
              hoveredCardId === project.id || pinnedCardId === project.id;

            return (
              <ProjectCard3D
                key={project.id}
                project={project}
                index={index}
                isFlipped={isFlipped}
                isDark={isDark}
                setSlotRef={(el) => {
                  cardSlotRefs.current[index] = el;
                }}
                onHoverStart={() => {
                  if (hoveredCardId !== project.id) {
                    soundEngine.playHoverTick();
                  }
                  setHoveredCardId(project.id);
                }}
                onHoverEnd={() => {
                  setHoveredCardId((prev) =>
                    prev === project.id ? null : prev
                  );
                }}
                onToggleFlip={() => handleCardToggleFlip(project.id)}
              />
            );
          })}

          {/* 9TH FINAL PANORAMIC ARCHIVE SLIDE */}
          <div
            ref={(el) => {
              cardSlotRefs.current[PROJECTS_DATA.length] = el;
            }}
            className="work-card-entry shrink-0 w-[clamp(265px,76vw,430px)] sm:w-[clamp(300px,24vw,430px)] h-[clamp(330px,54vh,440px)] sm:h-[clamp(355px,23.5vw,440px)] will-change-transform"
          >
            <div
              className={`relative w-full h-full rounded-[0_20%_0_20%] border bg-black text-cream p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 ${
                isDark ? 'border-accent/80' : 'border-cream'
              }`}
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-cream/25 pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-cream/70">
                  09 // ARCHIVE &amp; REPOS
                </span>
                <Sparkles className="w-4 h-4 text-cream/80" />
              </div>

              {/* Centre Copy */}
              <div className="my-auto py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/65 mb-2">
                  MORE ENGINEERING WORK
                </p>
                <h2 className="font-sans font-bold text-lg sm:text-2xl leading-snug text-cream">
                  Full-stack / backend / AI case studies and GitHub projects
                </h2>
                <p className="mt-2.5 sm:mt-3 font-sans text-xs sm:text-sm text-cream/75 leading-relaxed">
                  Explore complete Java Spring Boot microservices, React full-stack architectures, algorithmic implementations, and embedded robotics repositories.
                </p>
              </div>

              {/* Bottom CTA Links */}
              <div className="pt-3 border-t border-cream/25 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <a
                  href={PROFILE_DATA.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHoverTick()}
                  className="inline-flex items-center gap-2 bg-cream text-black rounded-[0_20%_0_20%] px-4 sm:px-5 py-2 sm:py-2.5 font-sans font-bold text-xs sm:text-sm tracking-wide border border-cream hover:bg-panel hover:text-cream transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub (@sujaypaul27)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <a
                  href={PROFILE_DATA.socials.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHoverTick()}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 border border-cream/60 font-mono text-xs text-cream hover:bg-cream hover:text-black transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>LeetCode</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM TRACK PROGRESS & QUICK NAVIGATION HUD (z-30)
         ===================================================================== */}
      <div className="fixed bottom-[7.6vh] sm:bottom-[8.2vh] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-black/80 border border-cream/30 text-cream">
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          onMouseEnter={() => soundEngine.playHoverTick()}
          aria-label="Previous project card"
          className="p-1 hover:bg-cream hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-mono text-[11px] sm:text-xs tracking-widest min-w-[48px] sm:min-w-[54px] text-center">
          {String(activeCardIdx).padStart(2, '0')} / 09
        </span>

        {/* Smooth Progress Line */}
        <div className="w-20 sm:w-36 h-[2px] bg-cream/25 overflow-hidden">
          <div
            ref={progressFillRef}
            className="w-full h-full bg-cream origin-left scale-x-0"
          />
        </div>

        {/* Dot Quick Jumpers */}
        <div className="hidden md:flex items-center gap-1.5">
          {Array.from({ length: PROJECTS_DATA.length + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              aria-label={`Jump to card ${idx + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeCardIdx === idx + 1
                  ? 'bg-cream scale-125'
                  : 'bg-cream/35 hover:bg-cream/70'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByStep(1)}
          onMouseEnter={() => soundEngine.playHoverTick()}
          aria-label="Next project card"
          className="p-1 hover:bg-cream hover:text-black transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ProjectCard3DProps {
  project: ProjectItem;
  index: number;
  isFlipped: boolean;
  isDark: boolean;
  setSlotRef: (el: HTMLDivElement | null) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onToggleFlip: () => void;
}

/**
 * Individual 3D Project Card with stationary hit-slot (zero hover edge flicker)
 * and 180deg Y-axis 3D flip between Cream Front Face and Black Back Face.
 */
function ProjectCard3D({
  project,
  index,
  isFlipped,
  isDark,
  setSlotRef,
  onHoverStart,
  onHoverEnd,
  onToggleFlip,
}: ProjectCard3DProps) {
  const numberLabel = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={setSlotRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onToggleFlip}
      className="work-card-entry shrink-0 w-[clamp(248px,72vw,325px)] sm:w-[clamp(260px,17.2vw,325px)] h-[clamp(330px,54vh,440px)] sm:h-[clamp(355px,23.5vw,440px)] will-change-transform cursor-pointer"
      style={{ perspective: '1400px' }}
    >
      {/* Inner 3D Flipper Container */}
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* =================================================================
            FRONT FACE (Cream fill, Ink text, asymmetric 0 20% 0 20%)
           ================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-[0_20%_0_20%] bg-cream text-ink border p-6 sm:p-7 flex flex-col justify-between ${
            isDark ? 'border-accent/70' : 'border-cream'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          {/* Top Index & Category Meta */}
          <div className="flex items-center justify-between border-b border-black/20 pb-3">
            <span className="font-mono text-xs font-bold tracking-widest text-black/80">
              {numberLabel} // {project.year}
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black/45 bg-panel/10 text-black">
              {project.category}
            </span>
          </div>

          {/* Centred Title & Concise Summary */}
          <div className="my-auto py-4 text-center flex flex-col items-center">
            <h2 className="font-sans font-bold text-[clamp(1.35rem,1.65vw,1.85rem)] leading-tight tracking-tight text-black">
              {project.title}
            </h2>

            <div className="w-12 h-[2px] bg-panel my-4" />

            <p className="font-sans font-normal text-xs sm:text-[0.84rem] leading-relaxed text-black/85 line-clamp-4">
              {project.shortDesc}
            </p>
          </div>

          {/* Bottom Tags Preview & Flip Hint */}
          <div className="pt-3 border-t border-black/20 flex flex-col gap-2.5">
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="font-mono italic text-[11px] font-bold text-panel"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black/65">
              <RotateCw className="w-3 h-3" />
              <span>Hover / Tap to Flip</span>
            </div>
          </div>
        </div>

        {/* =================================================================
            BACK FACE (Ink fill, 1px Cream outline, Image + Rule + Hashtags + Visit + GitHub)
           ================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-[0_20%_0_20%] bg-black text-cream border overflow-hidden flex flex-col justify-between ${
            isDark ? 'border-accent' : 'border-cream'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {/* Top Project Poster / Screenshot Preview */}
          <div className="relative w-full h-[44%] bg-panel/40 overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              loading="eager"
              decoding="async"
              draggable={false}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-2.5 left-3 bg-black/85 border border-cream/40 px-2 py-0.5 font-mono text-[10px] tracking-wider text-cream">
              {numberLabel} // {project.title}
            </div>
          </div>

          {/* Crisp 1px Cream Horizontal Rule */}
          <div className="w-full border-t border-cream" />

          {/* Back Content Body: Full Description + Hashtags + Action Buttons */}
          <div className="flex-1 p-5 flex flex-col justify-between bg-black">
            <div>
              <p className="font-sans text-xs leading-relaxed text-cream/90 line-clamp-3">
                {project.fullDesc}
              </p>

              {/* Ubuntu Mono Italic Hashtags */}
              <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 border-t border-cream/25 pt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono italic text-[11px] text-cream/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action Bar: Cream Visit Button (asymmetric 0 20% 0 20%) + GitHub Icon */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playClick();
                }}
                onMouseEnter={() => soundEngine.playHoverTick()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cream text-black rounded-[0_20%_0_20%] px-5 py-2 font-sans font-bold text-sm tracking-wide border border-cream hover:bg-panel hover:text-cream transition-colors"
              >
                <span>Visit</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub Repository`}
                title="View Source on GitHub"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playClick();
                }}
                onMouseEnter={() => soundEngine.playHoverTick()}
                className="w-10 h-10 rounded-full border border-cream flex items-center justify-center text-cream hover:bg-cream hover:text-black transition-colors shrink-0"
              >
                <Github className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
