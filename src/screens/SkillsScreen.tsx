import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Server, Code2, Cpu, Terminal } from 'lucide-react';
import { SKILLS_PANELS } from '@/data/portfolioData';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Phase 7: Skills Screen (/skills)
 * - Light Cream background (`palette.creamHex`) with interactive 3D Node Network (`SkillsNetwork3D` in SharedCanvas).
 * - Entry transition: White flash -> #41413e (`palette.panelHex`) curtain fades into Cream.
 * - Giant faint selectable "Skills" watermark at top-left.
 * - Two grouped 2px-bordered skill panels (`Backend & Systems Engineering` + `Full-Stack, Frontend & Tooling`)
 *   that invert to `#41413e` (`palette.panelHex`) fill with `#fbf4f3` (`palette.creamHex`) text on hover.
 */
export function SkillsScreen() {
  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const prefersReducedMotion = useAppStore((s) => s.prefersReducedMotion);
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);

  const screenRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const panelCurtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          { opacity: 0, duration: 0.62, ease: 'power3.inOut' },
          0.1
        );
      }

      tl.fromTo(
        '.skill-panel-entry',
        { y: 46, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.12,
          ease: 'power3.out',
        },
        0.24
      );
    }, screenRef);

    return () => ctx.revert();
  }, []);

  const getPanelTiltStyle = (idx: number) => {
    if (prefersReducedMotion) return {};
    const sideOffset = idx === 0 ? -0.8 : 0.8;
    const rotY = dampedPointer.x * 4.2 + sideOffset;
    const rotX = -dampedPointer.y * 3.6;
    return {
      transform: `perspective(1200px) rotateY(${rotY.toFixed(
        2
      )}deg) rotateX(${rotX.toFixed(2)}deg)`,
    };
  };

  return (
    <div
      ref={screenRef}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Light Surface Background at z-0 (sits behind SharedCanvas z-10 so SkillsNetwork3D is visible) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          background: isCustomTheme
            ? `radial-gradient(circle at 50% 50%, ${palette.creamHex} 0%, rgb(${palette.creamRgb} / 0.92) 70%, rgb(${palette.accentRgb} / 0.14) 100%)`
            : palette.creamHex,
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

      {/* Giant Faint Selectable "Skills" Watermark at Top-Left */}
      <div className="watermark-text fixed top-[6.2vh] left-[8vw] z-10 select-text">
        Skills
      </div>

      {/* =====================================================================
          TWO GROUPED SKILL PANELS (z-20, Side-by-Side on Desktop, Stacked Scrollable on Mobile/Tablet)
         ===================================================================== */}
      <div className="relative z-20 w-full h-full overflow-y-auto lg:overflow-hidden custom-scrollbar flex items-start lg:items-center justify-center px-[7.5vw] sm:px-[9.5vw] pt-[9vh] pb-[11vh] lg:py-[10vh]">
        <div className="w-full max-w-[1320px] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-11 items-stretch">
          {SKILLS_PANELS.map((panel, idx) => {
            const isHovered = hoveredPanel === idx;
            const PanelIcon = idx === 0 ? Server : Code2;
            const SubIcon = idx === 0 ? Cpu : Terminal;

            const bgStyle = isHovered
              ? palette.panelHex
              : `rgb(${palette.creamRgb} / 0.88)`;
            const textColor = isHovered ? palette.creamHex : palette.inkHex;
            const borderColor =
              isHovered && (isDark || isCustomTheme)
                ? palette.accentHex
                : palette.inkHex;
            const ruleColor = isHovered
              ? `rgb(${palette.creamRgb} / 0.3)`
              : `rgb(${palette.inkRgb} / 0.22)`;

            return (
              <div
                key={panel.title}
                onMouseEnter={() => {
                  setHoveredPanel(idx);
                  soundEngine.playHoverTick();
                }}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={() => {
                  soundEngine.playClick();
                  setHoveredPanel((prev) => (prev === idx ? null : idx));
                }}
                style={{
                  ...getPanelTiltStyle(idx),
                  backgroundColor: bgStyle,
                  color: textColor,
                  borderColor,
                  boxShadow:
                    isHovered && isDark
                      ? `0 18px 45px rgb(${palette.accentRgb} / 0.24)`
                      : 'none',
                }}
                className="skill-panel-entry border-2 backdrop-blur-[2px] p-5 sm:p-8 md:p-9 flex flex-col justify-between transition-colors duration-300 select-text cursor-pointer"
              >
                {/* Top Header: Icon + Centred Title + Description */}
                <div>
                  <div
                    style={{ borderColor: ruleColor }}
                    className="flex items-center justify-between border-b pb-3.5 mb-5"
                  >
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
                      0{idx + 1} // DOMAIN CLUSTER
                    </span>
                    <SubIcon
                      className="w-4 h-4"
                      style={{
                        color: isHovered ? palette.accentHex : textColor,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3 text-center">
                    <PanelIcon
                      className="w-6 h-6 shrink-0"
                      style={{
                        color: isHovered ? palette.accentHex : textColor,
                      }}
                    />
                    <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight">
                      {panel.title}
                    </h2>
                  </div>

                  <p className="mt-3 font-mono text-xs sm:text-sm leading-relaxed text-center opacity-90">
                    {panel.description}
                  </p>
                </div>

                {/* Categorized Skill Groups */}
                <div className="my-6 space-y-5">
                  {panel.groups.map((group) => (
                    <div key={group.label}>
                      <div className="font-mono font-bold text-xs uppercase tracking-[0.16em] mb-2.5 flex items-center gap-2">
                        <span
                          className="w-2 h-2 inline-block"
                          style={{
                            backgroundColor: isHovered
                              ? palette.accentHex
                              : palette.inkHex,
                          }}
                        />
                        <span>{group.label}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {group.items.map((skill) => (
                          <span
                            key={skill}
                            onMouseEnter={() => soundEngine.playHoverTick()}
                            style={{
                              borderColor: isHovered
                                ? `rgb(${palette.creamRgb} / 0.55)`
                                : `rgb(${palette.inkRgb} / 0.45)`,
                              backgroundColor: isHovered
                                ? `rgb(${palette.inkRgb} / 0.35)`
                                : `rgb(${palette.creamRgb} / 0.6)`,
                            }}
                            className="font-mono text-xs px-3 py-1 border transition-transform duration-150 hover:-translate-y-0.5"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Panel Footer Status */}
                <div
                  style={{ borderColor: ruleColor }}
                  className="pt-3 border-t flex items-center justify-between font-mono text-[11px] opacity-80"
                >
                  <span>
                    {idx === 0
                      ? 'SPRING BOOT • REST • SQL • OCI AI'
                      : 'REACT • TYPESCRIPT • VITE • DSA'}
                  </span>
                  <span>HOVER NODE MATRIX ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
