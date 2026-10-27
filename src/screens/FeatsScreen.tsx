import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Award,
  Briefcase,
  Code2,
  Terminal,
  Trophy,
  Flame,
  Eye,
  X,
  ArrowUpRight,
  Anchor,
  ShieldCheck,
} from 'lucide-react';
import {
  CERTIFICATES_DATA,
  PROFILE_DATA,
  CertificateItem,
} from '@/data/portfolioData';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';
import { soundEngine } from '@/utils/soundEngine';
import { ConsistencyModal } from '@/components/modals/ConsistencyModal';

type FeatsFilter = 'All' | 'Certificates' | 'Internships' | 'Achievements';

/**
 * Phase 8: Feats Screen (/feats)
 * - Light Cream surface with architectural grid + 3D Scroll-Driven Chain & Anchor (`FeatsChain3D` in SharedCanvas)
 *   plus a synchronized right-margin Chain & Anchor depth indicator.
 * - Filter chips: All, Certificates, Internships, Achievements.
 * - Two-column depth wall with #41413e (`palette.panelHex`) hover fill inversion.
 * - 8 verified certificates show high-res previews only (with in-app lightbox inspection, no download links).
 * - Consistency Card opens `ConsistencyModal` (GitHub 52-week heatmap + LeetCode 1,316 rating + offline fallback).
 * - Codeforces and AtCoder cards show "Profile" badge and link directly to handles.
 */
export function FeatsScreen() {
  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const prefersReducedMotion = useAppStore((s) => s.prefersReducedMotion);
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const featsScrollProgress = useAppStore((s) => s.featsScrollProgress);
  const setFeatsScrollProgress = useAppStore((s) => s.setFeatsScrollProgress);
  const setScrollVelocity = useAppStore((s) => s.setScrollVelocity);

  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const [activeFilter, setActiveFilter] = useState<FeatsFilter>('All');
  const [isConsistencyOpen, setIsConsistencyOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const screenRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const panelCurtainRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Entry transition choreography
  useEffect(() => {
    setFeatsScrollProgress(0.1);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (whiteFlashRef.current) {
        tl.fromTo(
          whiteFlashRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.28, ease: 'power2.out' },
          0
        );
      }

      if (panelCurtainRef.current) {
        tl.fromTo(
          panelCurtainRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.6, ease: 'power3.inOut' },
          0.1
        );
      }

      tl.fromTo(
        '.feats-entry-item',
        { y: 38, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
        },
        0.22
      );
    }, screenRef);

    return () => {
      ctx.revert();
      setScrollVelocity(0);
    };
  }, [setFeatsScrollProgress, setScrollVelocity]);

  // Close certificate preview lightbox on Escape
  useEffect(() => {
    if (!previewCert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playClick();
        setPreviewCert(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCert]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const progress = Math.max(0.08, Math.min(1, el.scrollTop / maxScroll));
    const velocity = el.scrollTop - lastScrollTopRef.current;
    lastScrollTopRef.current = el.scrollTop;

    setFeatsScrollProgress(progress);
    setScrollVelocity(velocity);
  };

  const filteredCertificates = CERTIFICATES_DATA.filter((cert) => {
    if (activeFilter === 'All') return true;
    return cert.category === activeFilter;
  });

  const showAchievements =
    activeFilter === 'All' || activeFilter === 'Achievements';

  // Shallow 3D cursor tilt for cards
  const cardTiltStyle = prefersReducedMotion
    ? {}
    : {
        transform: `perspective(1100px) rotateY(${(
          dampedPointer.x * 2.5
        ).toFixed(2)}deg) rotateX(${(-dampedPointer.y * 2.2).toFixed(2)}deg)`,
      };

  const visibleLinksCount = Math.max(
    3,
    Math.round(featsScrollProgress * 14)
  );

  return (
    <div
      ref={screenRef}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Light Surface Background with Subtle Architectural Grid at z-0 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: palette.creamHex,
          backgroundImage: `linear-gradient(to right, rgb(${palette.inkRgb} / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(${palette.inkRgb} / 0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Entry Transition Overlays */}
      <div
        ref={panelCurtainRef}
        className="fixed inset-0 pointer-events-none z-40 opacity-0"
        style={{ backgroundColor: palette.panelHex }}
        aria-hidden="true"
      />
      <div
        ref={whiteFlashRef}
        className="fixed inset-0 bg-white pointer-events-none z-40 opacity-0"
        aria-hidden="true"
      />

      {/* Giant Faint Selectable "FEATURES" Watermark at Top-Left */}
      <div className="watermark-text fixed top-[6vh] left-[8vw] z-10 select-text">
        FEATURES
      </div>

      {/* =====================================================================
          RIGHT-EDGE SYNCHRONIZED CHAIN & ANCHOR HUD GAUGE (Complements FeatsChain3D)
         ===================================================================== */}
      <div
        style={{
          color: isDark || isCustomTheme ? palette.accentHex : palette.inkHex,
          transform: `translate3d(${(dampedPointer.x * 6).toFixed(1)}px, 0, 0)`,
        }}
        className="hidden sm:flex fixed right-[4.4vw] top-0 z-30 flex-col items-center pointer-events-none"
        aria-hidden="true"
      >
        {Array.from({ length: visibleLinksCount }).map((_, idx) => (
          <div
            key={idx}
            style={{
              borderColor:
                isDark || isCustomTheme ? palette.accentHex : palette.inkHex,
            }}
            className={`w-3.5 h-5 border-2 rounded-full -mt-1 ${
              idx % 2 === 1 ? 'scale-x-50' : ''
            }`}
          />
        ))}
        <div
          style={{
            borderColor:
              isDark || isCustomTheme ? palette.accentHex : palette.inkHex,
            backgroundColor: palette.creamHex,
          }}
          className="mt-0.5 w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-sm"
        >
          <Anchor className="w-5 h-5" />
        </div>
      </div>

      {/* =====================================================================
          SCROLLABLE TWO-COLUMN DEPTH WALL (z-20)
         ===================================================================== */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative z-20 w-full h-full overflow-y-auto custom-scrollbar px-[7.5vw] sm:px-[9.5vw] pt-[11vh] pb-[14vh]"
      >
        <div className="w-full max-w-[1260px] mx-auto space-y-7">
          {/* Top Filter Chips Bar + Consistency Matrix Trigger */}
          <div
            style={{
              borderColor: palette.inkHex,
              backgroundColor: `rgb(${palette.creamRgb} / 0.92)`,
            }}
            className="feats-entry-item border-2 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center gap-2" role="tablist">
              {(
                [
                  { id: 'All', label: 'All (12)' },
                  { id: 'Certificates', label: 'Certificates (7)' },
                  { id: 'Internships', label: 'Internships (1)' },
                  { id: 'Achievements', label: 'Achievements (4)' },
                ] as const
              ).map((chip) => {
                const isSelected = activeFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveFilter(chip.id);
                    }}
                    onMouseEnter={() => soundEngine.playHoverTick()}
                    style={
                      isSelected
                        ? {
                            backgroundColor: palette.inkHex,
                            color: palette.creamHex,
                            borderColor: palette.inkHex,
                          }
                        : {
                            backgroundColor: palette.creamHex,
                            color: palette.inkHex,
                            borderColor: palette.inkHex,
                          }
                    }
                    className="px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all duration-150 hover:!bg-panel hover:!text-cream"
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsConsistencyOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHoverTick()}
              style={{
                backgroundColor: palette.panelHex,
                color: palette.creamHex,
                borderColor: palette.inkHex,
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <Flame
                className="w-3.5 h-3.5"
                style={{ color: palette.accentHex }}
              />
              <span>Consistency Matrix (1,316)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TWO-COLUMN DEPTH WALL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 1. FEATURED CONSISTENCY MATRIX CARD (Opens Modal) */}
            {showAchievements && (
              <div
                onMouseEnter={() => {
                  setHoveredCardId('consistency-card');
                  soundEngine.playHoverTick();
                }}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => {
                  soundEngine.playClick();
                  setIsConsistencyOpen(true);
                }}
                style={{
                  ...cardTiltStyle,
                  backgroundColor:
                    hoveredCardId === 'consistency-card'
                      ? palette.panelHex
                      : palette.inkHex,
                  color: palette.creamHex,
                  borderColor:
                    isDark || isCustomTheme
                      ? palette.accentHex
                      : palette.inkHex,
                }}
                className="feats-entry-item md:col-span-2 border-2 p-6 sm:p-7 cursor-pointer transition-colors duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 select-text"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
                    <Flame
                      className="w-4 h-4"
                      style={{ color: palette.accentHex }}
                    />
                    <span>FEATURED TELEMETRY // CONSISTENCY &amp; DSA</span>
                  </div>
                  <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">
                    GitHub Contribution Heatmap &amp; LeetCode Contest Rating (1,316)
                  </h2>
                  <p className="font-mono text-xs sm:text-sm opacity-90 leading-relaxed">
                    Interactive 52-week engineering commit matrix for @sujaypaul27, algorithmic problem-solving metrics across LeetCode, Codeforces, and AtCoder, with offline-ready telemetry snapshot.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    setIsConsistencyOpen(true);
                  }}
                  style={{
                    backgroundColor: palette.creamHex,
                    color: palette.inkHex,
                    borderColor: palette.creamHex,
                  }}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 border font-mono text-xs font-bold uppercase tracking-wider rounded-[0_18%_0_18%] hover:opacity-90 transition-opacity"
                >
                  <span>Open Matrix Modal</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 2. 8 VERIFIED CERTIFICATES & INTERNSHIP CARDS (Preview-Only + Lightbox) */}
            {filteredCertificates.map((cert, idx) => {
              const isHovered = hoveredCardId === cert.id;
              const bgStyle = isHovered
                ? palette.panelHex
                : `rgb(${palette.creamRgb} / 0.92)`;
              const textColor = isHovered ? palette.creamHex : palette.inkHex;
              const borderColor =
                isHovered && (isDark || isCustomTheme)
                  ? palette.accentHex
                  : palette.inkHex;

              return (
                <div
                  key={cert.id}
                  onMouseEnter={() => {
                    setHoveredCardId(cert.id);
                    soundEngine.playHoverTick();
                  }}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => {
                    soundEngine.playClick();
                    setPreviewCert(cert);
                  }}
                  style={{
                    ...cardTiltStyle,
                    backgroundColor: bgStyle,
                    color: textColor,
                    borderColor,
                  }}
                  className="feats-entry-item border-2 p-5 sm:p-6 flex flex-col justify-between transition-colors duration-300 cursor-pointer select-text"
                >
                  <div>
                    {/* Card Top Meta */}
                    <div
                      style={{
                        borderColor: isHovered
                          ? `rgb(${palette.creamRgb} / 0.3)`
                          : `rgb(${palette.inkRgb} / 0.2)`,
                      }}
                      className="flex items-center justify-between border-b pb-2.5 mb-3.5 font-mono text-xs"
                    >
                      <span className="font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                        {cert.category === 'Internships' ? (
                          <Briefcase className="w-3.5 h-3.5" />
                        ) : (
                          <Award className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {String(idx + 1).padStart(2, '0')} // {cert.category}
                        </span>
                      </span>
                      <span className="opacity-80">{cert.date}</span>
                    </div>

                    {/* Certificate Preview Image (Protected Preview-Only) */}
                    <div
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ borderColor: textColor }}
                      className="relative w-full h-48 sm:h-52 border bg-black/5 overflow-hidden mb-4 group"
                    >
                      <img
                        src={cert.image}
                        alt={cert.title}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/85 text-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Click to Inspect Preview</span>
                      </div>
                    </div>

                    {/* Title & Issuer */}
                    <h3 className="font-sans font-bold text-base sm:text-lg leading-snug">
                      {cert.title}
                    </h3>
                    <p className="mt-1 font-mono italic text-xs sm:text-sm opacity-85">
                      {cert.issuer}
                    </p>
                  </div>

                  {/* Credential ID, Score & Tags */}
                  <div
                    style={{
                      borderColor: isHovered
                        ? `rgb(${palette.creamRgb} / 0.3)`
                        : `rgb(${palette.inkRgb} / 0.2)`,
                    }}
                    className="mt-4 pt-3 border-t space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ID: {cert.credentialId}</span>
                      </span>
                      {cert.score && (
                        <span
                          style={{
                            backgroundColor: isHovered
                              ? palette.creamHex
                              : palette.inkHex,
                            color: isHovered
                              ? palette.inkHex
                              : palette.creamHex,
                          }}
                          className="px-2 py-0.5 font-bold text-[11px]"
                        >
                          Score: {cert.score}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {cert.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono italic text-[11px] opacity-80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3. COMPETITIVE PROGRAMMING PROFILE CARDS (LeetCode 1,316, Codeforces Profile, AtCoder Profile) */}
            {showAchievements &&
              PROFILE_DATA.codingProfiles.map((prof, idx) => {
                const cardId = `cp-${prof.platform}`;
                const isHovered = hoveredCardId === cardId;
                const Icon =
                  idx === 0 ? Code2 : idx === 1 ? Terminal : Trophy;

                const bgStyle = isHovered
                  ? palette.panelHex
                  : `rgb(${palette.creamRgb} / 0.92)`;
                const textColor = isHovered
                  ? palette.creamHex
                  : palette.inkHex;

                return (
                  <a
                    key={prof.platform}
                    href={prof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => {
                      setHoveredCardId(cardId);
                      soundEngine.playHoverTick();
                    }}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => soundEngine.playClick()}
                    style={{
                      ...cardTiltStyle,
                      backgroundColor: bgStyle,
                      color: textColor,
                      borderColor: palette.inkHex,
                    }}
                    className="feats-entry-item border-2 p-5 sm:p-6 flex flex-col justify-between transition-colors duration-300 select-text"
                  >
                    <div>
                      <div
                        style={{
                          borderColor: isHovered
                            ? `rgb(${palette.creamRgb} / 0.3)`
                            : `rgb(${palette.inkRgb} / 0.2)`,
                        }}
                        className="flex items-center justify-between border-b pb-2.5 mb-3.5 font-mono text-xs"
                      >
                        <span className="font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                          <Icon className="w-4 h-4" />
                          <span>ALGORITHMIC ARENA // {prof.platform}</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>

                      <div className="my-3 flex items-baseline justify-between gap-4">
                        <h3 className="font-sans font-bold text-xl sm:text-2xl">
                          {prof.platform}
                        </h3>
                        <span
                          style={{
                            backgroundColor: isHovered
                              ? palette.creamHex
                              : palette.inkHex,
                            color: isHovered
                              ? palette.inkHex
                              : palette.creamHex,
                          }}
                          className="font-mono font-bold text-sm px-3 py-1"
                        >
                          {prof.rating === 'Profile'
                            ? 'Profile'
                            : `Rating: ${prof.rating}`}
                        </span>
                      </div>

                      <p className="font-mono text-xs opacity-85">
                        Handle: @{prof.username} • {prof.badge}
                      </p>
                    </div>

                    <div
                      style={{
                        borderColor: isHovered
                          ? `rgb(${palette.creamRgb} / 0.3)`
                          : `rgb(${palette.inkRgb} / 0.2)`,
                      }}
                      className="mt-4 pt-3 border-t flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider"
                    >
                      <span>Open Official Profile</span>
                      <span>{prof.url.replace('https://', '')} ↗</span>
                    </div>
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          IN-APP CERTIFICATE PREVIEW LIGHTBOX (Preview-Only, No Download Links)
         ===================================================================== */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Certificate Preview: ${previewCert.title}`}
          onClick={() => {
            soundEngine.playClick();
            setPreviewCert(null);
          }}
          onContextMenu={(e) => e.preventDefault()}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: palette.inkHex,
              color: palette.creamHex,
              borderColor: palette.creamHex,
            }}
            className="relative w-full max-w-[860px] border-2 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: `rgb(${palette.panelRgb} / 0.4)`,
                borderColor: `rgb(${palette.creamRgb} / 0.35)`,
              }}
              className="px-5 py-3.5 border-b flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                  VERIFIED CREDENTIAL PREVIEW (READ-ONLY) • ID: {previewCert.credentialId}
                </div>
                <h3 className="font-sans font-bold text-base sm:text-lg">
                  {previewCert.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPreviewCert(null);
                }}
                aria-label="Close Certificate Preview"
                style={{
                  borderColor: palette.creamHex,
                  color: palette.creamHex,
                }}
                className="w-8 h-8 border flex items-center justify-center hover:!bg-cream hover:!text-black transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Res Certificate Image (No Download / Right-Click Disabled) */}
            <div className="p-4 sm:p-6 bg-black flex items-center justify-center max-h-[72vh] overflow-hidden">
              <img
                src={previewCert.image}
                alt={previewCert.title}
                draggable={false}
                className="max-w-full max-h-[65vh] object-contain select-none pointer-events-none"
              />
            </div>

            {/* Footer */}
            <div
              style={{
                backgroundColor: `rgb(${palette.panelRgb} / 0.35)`,
                borderColor: `rgb(${palette.creamRgb} / 0.35)`,
              }}
              className="px-5 py-2.5 border-t flex flex-wrap items-center justify-between gap-2 font-mono text-xs"
            >
              <span>
                Issued by {previewCert.issuer} • {previewCert.date}
              </span>
              <span className="opacity-80">
                Preview-Only Protection Active • Press ESC to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Consistency Matrix Modal (GitHub Heatmap + LeetCode 1,316) */}
      <ConsistencyModal
        isOpen={isConsistencyOpen}
        onClose={() => setIsConsistencyOpen(false)}
      />
    </div>
  );
}
