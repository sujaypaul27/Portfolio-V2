import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

export type ColorThemeId =
  | 'classic'
  | 'matrix'
  | 'amber'
  | 'cobalt'
  | 'crimson';

export interface PortfolioThemeConfig {
  id: ColorThemeId;
  name: string;
  shortName: string;
  subtitle: string;
  creamHex: string;
  creamRgb: string;
  inkHex: string;
  inkRgb: string;
  panelHex: string;
  panelRgb: string;
  accentHex: string;
  accentSoftHex: string;
  accentRgb: string;
  ghostRgba: string;
}

export const PORTFOLIO_THEMES: Record<ColorThemeId, PortfolioThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Cream',
    shortName: 'Classic',
    subtitle: 'Editorial Monochrome & Warm Ivory (Default)',
    creamHex: '#fbf4f3',
    creamRgb: '251 244 243',
    inkHex: '#000000',
    inkRgb: '0 0 0',
    panelHex: '#41413e',
    panelRgb: '65 65 62',
    accentHex: '#38bdf8',
    accentSoftHex: '#e0f2fe',
    accentRgb: '56 189 248',
    ghostRgba: 'rgba(128, 128, 128, 0.22)',
  },
  matrix: {
    id: 'matrix',
    name: 'Cyber Matrix',
    shortName: 'Matrix',
    subtitle: 'Phosphor Emerald & Deep Matrix Green',
    creamHex: '#d4f7e6',
    creamRgb: '212 247 230',
    inkHex: '#062c1e',
    inkRgb: '6 44 30',
    panelHex: '#0f4c35',
    panelRgb: '15 76 53',
    accentHex: '#10b981',
    accentSoftHex: '#6ee7b7',
    accentRgb: '16 185 129',
    ghostRgba: 'rgba(16, 185, 129, 0.24)',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    shortName: 'Amber',
    subtitle: 'Aerospace Gold & Warm Bronze Carbon',
    creamHex: '#faeac8',
    creamRgb: '250 234 200',
    inkHex: '#2a1704',
    inkRgb: '42 23 4',
    panelHex: '#6b4415',
    panelRgb: '107 68 21',
    accentHex: '#f59e0b',
    accentSoftHex: '#fcd34d',
    accentRgb: '245 158 11',
    ghostRgba: 'rgba(245, 158, 11, 0.24)',
  },
  cobalt: {
    id: 'cobalt',
    name: 'Arctic Cobalt',
    shortName: 'Cobalt',
    subtitle: 'Blueprint Ice & Abyssal Navy',
    creamHex: '#d8eaff',
    creamRgb: '216 234 255',
    inkHex: '#091e47',
    inkRgb: '9 30 71',
    panelHex: '#1d3f7a',
    panelRgb: '29 63 122',
    accentHex: '#3b82f6',
    accentSoftHex: '#93c5fd',
    accentRgb: '59 130 246',
    ghostRgba: 'rgba(59, 130, 246, 0.25)',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Pulse',
    shortName: 'Crimson',
    subtitle: 'Cyber Rose & Deep Bordeaux Onyx',
    creamHex: '#ffdbe2',
    creamRgb: '255 219 226',
    inkHex: '#300814',
    inkRgb: '48 8 20',
    panelHex: '#6e182e',
    panelRgb: '110 24 46',
    accentHex: '#f43f5e',
    accentSoftHex: '#fda4af',
    accentRgb: '244 63 94',
    ghostRgba: 'rgba(244, 63, 94, 0.25)',
  },
};

export const PORTFOLIO_THEME_LIST: PortfolioThemeConfig[] = [
  PORTFOLIO_THEMES.classic,
  PORTFOLIO_THEMES.matrix,
  PORTFOLIO_THEMES.amber,
  PORTFOLIO_THEMES.cobalt,
  PORTFOLIO_THEMES.crimson,
];

export function applyColorThemeToDocument(themeId: ColorThemeId) {
  if (typeof document === 'undefined') return;
  const cfg = PORTFOLIO_THEMES[themeId] ?? PORTFOLIO_THEMES.classic;
  const root = document.documentElement;
  root.style.setProperty('--cream', cfg.creamHex);
  root.style.setProperty('--cream-rgb', cfg.creamRgb);
  root.style.setProperty('--ink', cfg.inkHex);
  root.style.setProperty('--ink-rgb', cfg.inkRgb);
  root.style.setProperty('--panel', cfg.panelHex);
  root.style.setProperty('--panel-rgb', cfg.panelRgb);
  root.style.setProperty('--accent', cfg.accentHex);
  root.style.setProperty('--accent-rgb', cfg.accentRgb);
  root.style.setProperty('--ghost', cfg.ghostRgba);
}

interface Vector2D {
  x: number;
  y: number;
}

interface AppState {
  pointer: Vector2D;
  dampedPointer: Vector2D;
  scrollVelocity: number;
  theme: ThemeMode;
  colorTheme: ColorThemeId;
  soundEnabled: boolean;
  hasInteracted: boolean;
  isHeroOpen: boolean;
  isTransitioning: boolean;
  coreHovered: boolean;
  featsScrollProgress: number;
  prefersReducedMotion: boolean;
  isMobile: boolean;

  setPointer: (x: number, y: number) => void;
  stepDampedPointer: (delta: number) => void;
  setScrollVelocity: (v: number) => void;
  toggleTheme: () => void;
  setColorTheme: (themeId: ColorThemeId) => void;
  cycleColorTheme: () => void;
  toggleSound: () => void;
  markInteracted: () => void;
  setHeroOpen: (open: boolean) => void;
  setTransitioning: (transitioning: boolean) => void;
  setCoreHovered: (hovered: boolean) => void;
  setFeatsScrollProgress: (p: number) => void;
  setDeviceFlags: (prefersReducedMotion: boolean, isMobile: boolean) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('sp_tech_theme') as ThemeMode | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialColorTheme = (): ColorThemeId => {
  if (typeof window === 'undefined') return 'classic';
  const saved = window.localStorage.getItem(
    'sp_tech_color_theme'
  ) as ColorThemeId | null;
  if (saved && saved in PORTFOLIO_THEMES) {
    return saved;
  }
  return 'classic';
};

const getInitialSound = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('sp_tech_sound') === 'true';
};

export const useAppStore = create<AppState>((set, get) => ({
  pointer: { x: 0, y: 0 },
  dampedPointer: { x: 0, y: 0 },
  scrollVelocity: 0,
  theme: getInitialTheme(),
  colorTheme: getInitialColorTheme(),
  soundEnabled: getInitialSound(),
  hasInteracted: false,
  isHeroOpen: false,
  isTransitioning: false,
  coreHovered: false,
  featsScrollProgress: 0.08,
  prefersReducedMotion: false,
  isMobile: false,

  setPointer: (x, y) => {
    const clampedX = Math.max(-1, Math.min(1, x));
    const clampedY = Math.max(-1, Math.min(1, y));
    set({ pointer: { x: clampedX, y: clampedY } });
  },

  stepDampedPointer: (delta) => {
    const { pointer, dampedPointer, prefersReducedMotion } = get();
    if (prefersReducedMotion) {
      if (dampedPointer.x !== 0 || dampedPointer.y !== 0) {
        set({ dampedPointer: { x: 0, y: 0 } });
      }
      return;
    }
    const lambda = 6.5;
    const factor = 1 - Math.exp(-lambda * Math.min(delta, 0.1));
    const nx = dampedPointer.x + (pointer.x - dampedPointer.x) * factor;
    const ny = dampedPointer.y + (pointer.y - dampedPointer.y) * factor;
    set({ dampedPointer: { x: nx, y: ny } });
  },

  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sp_tech_theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),

  setColorTheme: (themeId) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sp_tech_color_theme', themeId);
    }
    applyColorThemeToDocument(themeId);
    set({ colorTheme: themeId });
  },

  cycleColorTheme: () => {
    const { colorTheme } = get();
    const currentIndex = PORTFOLIO_THEME_LIST.findIndex(
      (t) => t.id === colorTheme
    );
    const nextTheme =
      PORTFOLIO_THEME_LIST[(currentIndex + 1) % PORTFOLIO_THEME_LIST.length];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sp_tech_color_theme', nextTheme.id);
    }
    applyColorThemeToDocument(nextTheme.id);
    set({ colorTheme: nextTheme.id });
  },

  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sp_tech_sound', String(next));
      }
      return { soundEnabled: next, hasInteracted: true };
    }),

  markInteracted: () => set({ hasInteracted: true }),
  setHeroOpen: (open) => set({ isHeroOpen: open }),
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  setCoreHovered: (hovered) => set({ coreHovered: hovered }),
  setFeatsScrollProgress: (p) =>
    set({ featsScrollProgress: Math.max(0.05, Math.min(1, p)) }),
  setDeviceFlags: (prefersReducedMotion, isMobile) =>
    set({ prefersReducedMotion, isMobile }),
}));
