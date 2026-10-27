import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Briefcase,
  GraduationCap,
  Layers,
  MapPin,
  Award,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { PROFILE_DATA, TIMELINE_DATA } from '@/data/portfolioData';
import { useAppStore, PORTFOLIO_THEMES } from '@/store/useAppStore';
import { soundEngine } from '@/utils/soundEngine';
import { Avatar, AvatarPose } from '@/components/canvas/Avatar';

type AboutTab = 'bio' | 'timeline' | 'trajectory';

const CAREER_STAGES = [
  {
    stage: 'STAGE 01 // CORE FOCUS',
    title: 'Java Backend & Distributed Systems',
    summary:
      'Architecting resilient enterprise backend services, RESTful APIs, relational database schemas, and real-time event streams.',
    stack: [
      'Java (Core, OOP, Collections)',
      'Spring Boot',
      'REST APIs',
      'SQL & DBMS',
      'Server-Sent Events (SSE)',
      'H2 / Relational Persistence',
    ],
  },
  {
    stage: 'STAGE 02 // EXPANSION',
    title: 'Full-Stack Web & Cloud Engineering',
    summary:
      'Connecting high-throughput Java backends with responsive React + TypeScript frontends, interactive 3D interfaces, and cloud deployments.',
    stack: [
      'React.js & TypeScript',
      'Vite & Tailwind CSS',
      'Zoho Catalyst & Vercel',
      'Swagger / OpenAPI & Postman',
      'Dart (Cross-Platform Mobile)',
    ],
  },
  {
    stage: 'STAGE 03 // HORIZON',
    title: 'Applied AI & Autonomous Embedded Systems',
    summary:
      'Bridging software engineering with Oracle Cloud Generative AI, edge AI deployment, and sensor-driven robotics.',
    stack: [
      'Oracle OCI Generative AI & LLMs',
      'Qualcomm Edge AI & Arduino',
      'IoT Sensor Networks (NPTEL Elite)',
      'Autonomous Robotics (AquaFlare)',
    ],
  },
];

export function AboutScreen() {
  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const prefersReducedMotion = useAppStore((s) => s.prefersReducedMotion);
  const theme = useAppStore((s) => s.theme);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const isDark = theme === 'dark';
  const isCustomTheme = colorTheme !== 'classic';
  const palette = PORTFOLIO_THEMES[colorTheme] ?? PORTFOLIO_THEMES.classic;

  const [activeTab, setActiveTab] = useState<AboutTab>('bio');
  const [aboutPose, setAboutPose] = useState<AvatarPose>('laptop');

  const screenRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const greyCurtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (whiteFlashRef.current) {
        tl.fromTo(
          whiteFlashRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.3, ease: 'power2.out' },
          0
        );
      }

      if (greyCurtainRef.current) {
        tl.fromTo(
          greyCurtainRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.62, ease: 'power3.inOut' },
          0.1
        );
      }

      tl.fromTo(
        '.about-box-entry',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.72, ease: 'power3.out' },
        0.24
      ).fromTo(
        '.about-avatar-entry',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.78, ease: 'power3.out' },
        0.32
      );
    }, screenRef);

    return () => ctx.revert();
  }, []);

  const boxTiltStyle = prefersReducedMotion
    ? {}
    : {
        transform: `perspective(1200px) rotateY(${(
          dampedPointer.x * 3.2
        ).toFixed(2)}deg) rotateX(${(-dampedPointer.y * 2.8).toFixed(2)}deg)`,
      };

  const handleTabChange = (tab: AboutTab) => {
    if (tab === activeTab) return;
    soundEngine.playClick();
    setActiveTab(tab);
  };

  const frameBorderColor =
    isCustomTheme || isDark ? palette.accentHex : palette.creamHex;
  const boxGlowShadow = isDark
    ? `0 0 38px rgb(${palette.accentRgb} / 0.24)`
    : isCustomTheme
    ? `0 0 24px rgb(${palette.accentRgb} / 0.15)`
    : 'none';

  return (
    <div
      ref={screenRef}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Dynamic Theme Atmospheric Background at z-0 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          background: isCustomTheme
            ? `radial-gradient(circle at 72% 46%, rgb(${palette.panelRgb} / 0.52) 0%, rgb(${palette.inkRgb} / 0.96) 55%, ${palette.inkHex} 100%)`
            : palette.inkHex,
        }}
        aria-hidden="true"
      />

      {/* Entry Transition Overlays */}
      <div
        ref={greyCurtainRef}
        className="fixed inset-0 pointer-events-none z-40 opacity-0"
        style={{ backgroundColor: palette.panelHex }}
        aria-hidden="true"
      />
      <div
        ref={whiteFlashRef}
        className="fixed inset-0 bg-white pointer-events-none z-40 opacity-0"
        aria-hidden="true"
      />

      {/* Giant Faint Selectable "ABOUT" Watermark at Top-Left */}
      <div className="watermark-text fixed top-[6.5vh] left-[8vw] z-10 select-text">
        ABOUT
      </div>

      {/* =====================================================================
          MAIN NON-OVERLAPPING GRID (Left 7/12 Bordered Box + Right 5/12 Portrait)
         ===================================================================== */}
      <div className="relative z-20 w-full h-full overflow-y-auto lg:overflow-hidden custom-scrollbar flex items-start lg:items-center justify-center px-[7.5vw] sm:px-[9vw] pt-[9vh] pb-[11vh] lg:py-[10vh]">
        <div className="w-full max-w-[1440px] lg:h-[74vh] lg:max-h-[620px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* LEFT COLUMN (7/12 on Desktop): 2px Solid Bordered Box */}
          <div className="about-box-entry lg:col-span-7 xl:col-span-7 h-full flex items-center">
            <div
              style={{
                ...boxTiltStyle,
                backgroundColor: `rgb(${palette.inkRgb} / 0.88)`,
                borderColor: frameBorderColor,
                boxShadow: boxGlowShadow,
                color: palette.creamHex,
              }}
              className="w-full h-[58vh] sm:h-[62vh] lg:h-[64vh] min-h-[370px] max-h-[560px] backdrop-blur-[2px] border-2 flex flex-col justify-between transition-all duration-300 select-text"
            >
              {/* Top Tab Navigation Bar (Always-visible text + theme panel hover effect) */}
              <div
                style={{
                  backgroundColor: `rgb(${palette.panelRgb} / 0.32)`,
                  borderColor: `rgb(${palette.creamRgb} / 0.35)`,
                }}
                className="shrink-0 border-b px-3.5 sm:px-7 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div
                  className="flex flex-wrap items-center gap-1.5 sm:gap-2.5"
                  role="tablist"
                >
                  {(
                    [
                      { id: 'bio', label: '01 // BIO' },
                      { id: 'timeline', label: '02 // TIMELINE' },
                      { id: 'trajectory', label: '03 // TRAJECTORY' },
                    ] as const
                  ).map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleTabChange(tab.id)}
                        onMouseEnter={() => soundEngine.playHoverTick()}
                        style={
                          isActive
                            ? {
                                backgroundColor: palette.creamHex,
                                color: palette.inkHex,
                                borderColor: palette.creamHex,
                              }
                            : {
                                backgroundColor: palette.inkHex,
                                color: palette.creamHex,
                                borderColor: `rgb(${palette.creamRgb} / 0.65)`,
                              }
                        }
                        className="px-2.5 sm:px-4 py-1 sm:py-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-wider border transition-all duration-200 hover:!bg-panel hover:!text-cream hover:-translate-y-0.5 font-bold"
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <span
                  style={{ color: palette.creamHex }}
                  className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] opacity-85"
                >
                  <MapPin
                    className="w-3.5 h-3.5"
                    style={{ color: palette.accentHex }}
                  />
                  <span>Chennai, IN</span>
                </span>
              </div>

              {/* Scrollable Interior Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-9 py-6 sm:py-7">
                {/* TAB 1: BIO */}
                {activeTab === 'bio' && (
                  <div
                    className="h-full flex flex-col justify-between gap-4"
                    style={{ color: palette.creamHex }}
                  >
                    <div className="space-y-4 my-auto">
                      {PROFILE_DATA.aboutParagraphs.map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="font-mono italic text-[clamp(0.95rem,1.22vw,1.16rem)] leading-[1.72] tracking-[0.02em]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div
                      style={{ borderColor: `rgb(${palette.creamRgb} / 0.3)` }}
                      className="pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div
                        style={{
                          borderColor: `rgb(${palette.creamRgb} / 0.45)`,
                          backgroundColor: `rgb(${palette.panelRgb} / 0.25)`,
                        }}
                        className="border px-3.5 py-2.5 hover:!bg-panel transition-colors"
                      >
                        <div
                          style={{ color: palette.accentSoftHex }}
                          className="font-mono text-[10px] uppercase tracking-widest"
                        >
                          DEGREE &amp; STANDING
                        </div>
                        <div className="mt-1 font-sans font-bold text-xs sm:text-sm">
                          B.E. ECE (Telecom) • 5th Sem • CGPA 8.02
                        </div>
                      </div>
                      <div
                        style={{
                          borderColor: `rgb(${palette.creamRgb} / 0.45)`,
                          backgroundColor: `rgb(${palette.panelRgb} / 0.25)`,
                        }}
                        className="border px-3.5 py-2.5 hover:!bg-panel transition-colors"
                      >
                        <div
                          style={{ color: palette.accentSoftHex }}
                          className="font-mono text-[10px] uppercase tracking-widest"
                        >
                          PRIMARY ENGINEERING FOCUS
                        </div>
                        <div className="mt-1 font-sans font-bold text-xs sm:text-sm">
                          Java Backend, Spring Boot &amp; Full-Stack
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TIMELINE */}
                {activeTab === 'timeline' && (
                  <div
                    style={{
                      borderColor: `rgb(${palette.creamRgb} / 0.45)`,
                      color: palette.creamHex,
                    }}
                    className="relative pl-5 border-l space-y-6"
                  >
                    {TIMELINE_DATA.map((item) => (
                      <div key={item.id} className="relative group">
                        <span
                          style={{
                            backgroundColor: palette.inkHex,
                            borderColor: palette.accentHex,
                          }}
                          className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 border-2 transition-colors"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            style={{
                              backgroundColor: palette.creamHex,
                              color: palette.inkHex,
                            }}
                            className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5"
                          >
                            {item.period}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] opacity-85">
                            {item.type === 'experience' ? (
                              <Briefcase className="w-3.5 h-3.5" />
                            ) : (
                              <GraduationCap className="w-3.5 h-3.5" />
                            )}
                            <span>{item.location}</span>
                          </span>
                        </div>

                        <h3 className="mt-2 font-sans font-bold text-base sm:text-lg">
                          {item.title}
                        </h3>
                        <p
                          style={{ color: palette.accentSoftHex }}
                          className="font-mono italic text-xs sm:text-sm"
                        >
                          {item.organization}
                        </p>

                        <ul className="mt-2.5 space-y-1.5">
                          {item.highlights.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className="font-mono text-xs leading-relaxed opacity-95 flex items-start gap-2"
                            >
                              <span
                                style={{ color: palette.accentHex }}
                                className="mt-0.5"
                              >
                                ▹
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <div className="relative group">
                      <span
                        style={{
                          backgroundColor: palette.inkHex,
                          borderColor: palette.accentHex,
                        }}
                        className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 border-2 transition-colors"
                      />
                      <div className="flex items-center justify-between">
                        <span
                          style={{ borderColor: palette.creamHex }}
                          className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 border"
                        >
                          2025 – 2026 // CREDENTIALS
                        </span>
                        <Award
                          className="w-4 h-4"
                          style={{ color: palette.accentHex }}
                        />
                      </div>
                      <h3 className="mt-2 font-sans font-bold text-base">
                        Oracle OCI, Qualcomm AI &amp; NPTEL Elite Certifications
                      </h3>
                      <p className="mt-1 font-mono text-xs leading-relaxed opacity-90">
                        Oracle Certified Generative AI Professional • Oracle AI Foundations Associate • Qualcomm &amp; Arduino Hands-On AI • 3× NPTEL Elite (IoT 70%, Soft Skills 71%, Sensors &amp; Actuators 61%).
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: TRAJECTORY */}
                {activeTab === 'trajectory' && (
                  <div
                    className="space-y-4"
                    style={{ color: palette.creamHex }}
                  >
                    {CAREER_STAGES.map((stageItem) => (
                      <div
                        key={stageItem.stage}
                        style={{
                          borderColor: `rgb(${palette.creamRgb} / 0.45)`,
                          backgroundColor: `rgb(${palette.panelRgb} / 0.22)`,
                        }}
                        className="border p-4 hover:!bg-panel transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            style={{ color: palette.accentSoftHex }}
                            className="font-mono text-[11px] font-bold tracking-widest"
                          >
                            {stageItem.stage}
                          </span>
                          <Layers
                            className="w-4 h-4"
                            style={{ color: palette.accentHex }}
                          />
                        </div>
                        <h3 className="mt-1 font-sans font-bold text-base sm:text-lg">
                          {stageItem.title}
                        </h3>
                        <p className="mt-1 font-mono italic text-xs leading-relaxed opacity-90">
                          {stageItem.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {stageItem.stack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                borderColor: `rgb(${palette.creamRgb} / 0.5)`,
                              }}
                              className="font-mono text-[10px] px-2 py-0.5 border"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Status Bar inside the 2px Box (Always High-Contrast Visible) */}
              <div
                style={{
                  backgroundColor: `rgb(${palette.panelRgb} / 0.32)`,
                  borderColor: `rgb(${palette.creamRgb} / 0.35)`,
                  color: palette.creamHex,
                }}
                className="shrink-0 border-t px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]"
              >
                <span>R.M.D. ENGINEERING COLLEGE (2024–2028)</span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles
                    className="w-3.5 h-3.5"
                    style={{ color: palette.accentHex }}
                  />
                  <span>LEETCODE: 1,316 • CGPA: 8.02</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5/12 on Desktop, stacked below on Mobile/Tablet): Floating Asymmetric Portrait Frame with Waist-Up Avatar */}
          <div className="about-avatar-entry flex lg:col-span-5 xl:col-span-5 h-[44vh] sm:h-[50vh] lg:h-[64vh] max-h-[560px] flex-col items-center justify-between relative">
            <div
              style={{
                borderColor: frameBorderColor,
                boxShadow: boxGlowShadow,
                background: `linear-gradient(180deg, rgb(${palette.panelRgb} / 0.45) 0%, rgb(${palette.inkRgb} / 0.96) 100%)`,
                color: palette.creamHex,
              }}
              className="about-avatar-float relative w-full max-w-[390px] flex-1 rounded-[0_18%_0_18%] border-2 overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              {/* Always-Visible Portrait Header Strip */}
              <div
                style={{
                  borderColor: `rgb(${palette.creamRgb} / 0.35)`,
                  backgroundColor: `rgb(${palette.inkRgb} / 0.65)`,
                  color: palette.creamHex,
                }}
                className="px-5 py-3 border-b flex items-center justify-between font-mono text-[11px] tracking-widest z-20"
              >
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Terminal
                    className="w-3.5 h-3.5"
                    style={{ color: palette.accentHex }}
                  />
                  <span>SUJAY PAUL . P</span>
                </span>
                <span
                  style={{
                    borderColor: palette.accentHex,
                    color: palette.accentSoftHex,
                  }}
                  className="px-2 py-0.5 border text-[10px] font-bold"
                >
                  {aboutPose === 'laptop' ? 'MODE // CODING' : 'MODE // GREETING'}
                </span>
              </div>

              <div className="relative flex-1 w-full flex items-end justify-center overflow-hidden pt-2">
                <Avatar pose={aboutPose} />
              </div>
            </div>

            {/* Always-Visible Pose Switcher Buttons with Panel Hover Fill */}
            <div
              style={{
                backgroundColor: palette.inkHex,
                borderColor: frameBorderColor,
              }}
              className="mt-4 z-20 flex items-center gap-2 border p-1.5"
            >
              {(
                [
                  { id: 'laptop', label: '01 // Coding Pose' },
                  { id: 'waving', label: '02 // Waving Pose' },
                ] as const
              ).map((p) => {
                const isSelected = aboutPose === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setAboutPose(p.id);
                    }}
                    onMouseEnter={() => soundEngine.playHoverTick()}
                    style={
                      isSelected
                        ? {
                            backgroundColor: palette.creamHex,
                            color: palette.inkHex,
                            borderColor: palette.creamHex,
                          }
                        : {
                            backgroundColor: palette.inkHex,
                            color: palette.creamHex,
                            borderColor: `rgb(${palette.creamRgb} / 0.55)`,
                          }
                    }
                    className="px-3.5 py-1 font-mono text-xs uppercase tracking-wider border font-bold transition-all duration-200 hover:!bg-panel hover:!text-cream hover:-translate-y-0.5"
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
