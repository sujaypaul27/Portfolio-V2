# SP // TECH — Developer Portfolio

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

**An interactive, cinematic 3D portfolio showcasing full-stack engineering, Java backend systems, and cloud AI projects.**

[🌐 Live Demo](https://sujaypaulportfolio-v2.vercel.app/) • [👤 Sujay Paul . P](https://github.com/sujaypaul27) • [💼 LinkedIn](https://www.linkedin.com/in/sujay-paul272006)

</div>

---

## 🌟 Highlights & Features

- **Interactive 3D Visual Experience:** Powered by **Three.js** and **React Three Fiber (`@react-three/fiber`, `@react-three/drei`)**, featuring interactive camera rigs, procedural starfields, and particle systems.
- **Audio Engine:** Curated sound feedback with **Howler.js** for an engaging tactile interface experience.
- **Performance Optimized:** 
  - Code-splitting with custom **Vite Rollup chunking** (`vendor-three`, `vendor-r3f`, `vendor-gsap`, `vendor-react`).
  - Next-gen **WebP** image assets with low-priority and preloaded LCP hero image hints.
  - Fully responsive, smooth layout using **Lenis** and **Tailwind CSS**.
- **Centralized State:** Built using **Zustand** for lightweight and reactive UI state transitions.
- **SEO & Discoverability:** Rich metadata with **Schema.org JSON-LD Person markup**, Open Graph cards, dynamic sitemap, and accessible `<noscript>` fallback.

---

## 🛠️ Tech Stack

### **Frontend & Rendering**
- **Core:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **3D & Canvas:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation:** [GSAP (GreenSock)](https://gsap.com/), [Lenis](https://lenis.darkroom.engineering/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Audio:** [Howler.js](https://howlerjs.com/)
- **Icons & Fonts:** [Lucide React](https://lucide.dev/), Fontsource (`Karla`, `Michroma`, `Ubuntu Mono`, `Unbounded`)

---

## 📂 Project Structure

```text
portfolio/
├── public/                 # Static assets, WebP images, sitemap & robots.txt
│   └── assets/             # Avatars, certificates, projects, and resume
├── src/
│   ├── components/
│   │   ├── canvas/         # 3D Scene components (TechCore, Starfield, Avatar, Rig)
│   │   ├── frame/          # Fixed navigation frame and layout HUD
│   │   └── modals/         # Consistency modal, resume viewer
│   ├── data/
│   │   └── portfolioData.ts# Centralized project, profile, and achievement data
│   ├── screens/            # Screen views (Home, About, Skills, Work, Feats)
│   ├── store/              # Zustand state store
│   ├── utils/              # Sound engine and utility functions
│   ├── App.tsx             # Root component with routing and scene management
│   └── main.tsx            # Application entrypoint
├── index.html              # HTML shell with meta tags & Schema.org JSON-LD
├── vercel.json             # Security headers & SPA rewrites configuration
├── vite.config.ts          # Manual chunk splitting & build configuration
└── package.json            # Scripts and dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm**, **pnpm**, or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sujaypaul27/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches the local Vite development server with HMR |
| `npm run build` | Runs TypeScript compilation (`tsc -b`) and generates production bundle (`dist/`) |
| `npm run preview` | Locally serves the production build for testing |
| `npm run typecheck` | Checks TypeScript types across the codebase without emitting files |

---

## 🛡️ Production & Security Configuration

The site includes production configuration via `vercel.json`:
- **Security Headers:** Strict `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and explicit `Permissions-Policy`.
- **Cache Strategy:** 1-year immutable caching on static assets (`/assets/(.*)`).
- **SPA Rewrites:** Seamless client-side routing on Vercel.

---

## 👤 Author

**Sujay Paul . P**
- **Website:** [sujaypaul.vercel.app](https://sujaypaulportfolio-v2.vercel.app/)
- **GitHub:** [@sujaypaul27](https://github.com/sujaypaul27)
- **LinkedIn:** [sujay-paul272006](https://www.linkedin.com/in/sujay-paul272006)
- **Email:** [sujaypaul2711@gmail.com](mailto:sujaypaul2711@gmail.com)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
