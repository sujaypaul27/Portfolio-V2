export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  tags: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  year: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  score?: string;
  category: 'Certificates' | 'Internships' | 'Achievements';
  tags: string[];
  image: string;
  pdfUrl?: string;
}

export interface TimelineItem {
  id: string;
  period: string;
  title: string;
  organization: string;
  location: string;
  type: 'experience' | 'education' | 'stage';
  highlights: string[];
}

export const PROFILE_DATA = {
  name: 'Sujay Paul . P',
  monogram: 'SP // TECH',
  roleLine: 'Java Backend Developer • Full-Stack Engineer • AI & Embedded Systems',
  heroSubtitle:
    'B.E. ECE (Telecommunication) Undergraduate • Building scalable Java & Spring Boot backends, React full-stack platforms, and intelligent systems.',
  email: 'sujaypaul2711@gmail.com',
  phone: '+91 9384491422',
  location: 'Chennai / Tiruvallur, Tamil Nadu, India',
  resumeUrl: '/assets/resume/Sujay_Paul_P_Resume.pdf',
  socials: {
    github: 'https://github.com/sujaypaul27',
    linkedin: 'https://www.linkedin.com/in/sujay-paul272006',
    leetcode: 'https://leetcode.com/u/sujaypaul27/',
    codeforces: 'https://codeforces.com/profile/sujaypaul27',
    atcoder: 'https://atcoder.jp/users/sujaypaul27',
    email: 'mailto:sujaypaul2711@gmail.com',
  },
  codingProfiles: [
    {
      platform: 'LeetCode',
      username: 'sujaypaul27',
      rating: '1,316',
      badge: 'Active Contestant',
      url: 'https://leetcode.com/u/sujaypaul27/',
    },
    {
      platform: 'Codeforces',
      username: 'sujaypaul27',
      rating: 'Profile',
      badge: 'Competitive Programmer',
      url: 'https://codeforces.com/profile/sujaypaul27',
    },
    {
      platform: 'AtCoder',
      username: 'sujaypaul27',
      rating: 'Profile',
      badge: 'Algorithmic Solver',
      url: 'https://atcoder.jp/users/sujaypaul27',
    },
  ],
  aboutParagraphs: [
    "I'm Sujay Paul . P — a Java Backend & Full-Stack Engineer currently pursuing B.E. ECE at R.M.D. Engineering College, Chennai (CGPA 8.02).",
    'I architect resilient Spring Boot APIs, real-time cloud systems, and interactive React interfaces—turning complex backend logic into fast, clean user experiences.',
    'From enterprise platforms (SkillSphere, RecoverMandate, ShiftGuard) to Oracle Cloud AI and autonomous robotics, I love building software that ships and scales.',
  ],
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'skillsphere-nexus',
    title: 'SkillSphere Nexus',
    category: 'Full-Stack Enterprise LMS',
    shortDesc:
      'Employee skills, assessment tracking, and certification management platform with separate HR and employee portals.',
    fullDesc:
      'Developed during the Infosys Springboard Java Full-Stack Internship. Integrates a React (Vite) frontend with Java Spring Boot REST APIs and an H2 database for role-based skill verification, learning analytics, and certification expiry tracking.',
    tags: ['#Java', '#SpringBoot', '#React', '#RESTAPI', '#H2Database', '#FullStack'],
    image: '/assets/projects/skillsphere.webp',
    liveUrl: 'https://github.com/sujaypaul27/SKILLSPHERE_NEXUS-FULLSTACK-',
    githubUrl: 'https://github.com/sujaypaul27/SKILLSPHERE_NEXUS-FULLSTACK-',
    year: '2026',
  },
  {
    id: 'recover-mandate',
    title: 'RecoverMandate',
    category: 'Backend & Mandate Recovery',
    shortDesc:
      'Centralized mandate recovery management system with real-time status tracking, search filters, and analytics.',
    fullDesc:
      'Engineered to streamline mandate recovery workflows with structured business logic, RESTful endpoints, user access control, and SQL persistence.',
    tags: ['#Java', '#SpringBoot', '#Backend', '#RESTAPI', '#SQL', '#DBMS'],
    image: '/assets/projects/recovermandate.webp',
    liveUrl: 'https://recovermandate.vercel.app/',
    githubUrl: 'https://github.com/sujaypaul27/recovermandate',
    year: '2026',
  },
  {
    id: 'shiftguard',
    title: 'ShiftGuard',
    category: 'Workforce & Cloud Platform',
    shortDesc:
      'Workforce shift-scheduling application with Server-Sent Events (SSE), dispatch logs, and Zoho Catalyst deployment.',
    fullDesc:
      'Combines a React (Vite) frontend and Java Spring Boot backend with real-time SSE notifications, simulated dispatch workflows, payment-link API integration, and cloud deployment on Zoho Catalyst.',
    tags: ['#React', '#Java', '#SpringBoot', '#SSE', '#ZohoCatalyst', '#Cloud'],
    image: '/assets/projects/shiftguard.webp',
    liveUrl: 'https://github.com/sujaypaul27/shiftguardv3',
    githubUrl: 'https://github.com/sujaypaul27/shiftguardv3',
    year: '2026',
  },
  {
    id: 'skillswap',
    title: 'SkillSwap',
    category: 'Algorithmic Web App',
    shortDesc:
      'Peer skill-matching web application powered by the Jaccard similarity coefficient algorithm.',
    fullDesc:
      'Single-page web application that computes set-based Jaccard similarity scores between user skill profiles to pair complementary learners and collaborators.',
    tags: ['#JaccardSimilarity', '#Algorithms', '#WebDevelopment', '#HTML', '#AIassisted'],
    image: '/assets/projects/skillswap.webp',
    liveUrl: 'https://sujaypaulvibecoding1.vercel.app/',
    githubUrl: 'https://github.com/sujaypaul27/SkillSwap',
    year: '2026',
  },
  {
    id: 'reel-saver',
    title: 'Reel Saver',
    category: 'Mobile Application',
    shortDesc:
      'Cross-platform mobile utility built with Dart for fast media stream fetching and local archiving.',
    fullDesc:
      'Demonstrates mobile application architecture, asynchronous network handling, and release packaging beyond browser-based applications.',
    tags: ['#Dart', '#MobileDevelopment', '#AppDevelopment', '#GitHubReleases'],
    image: '/assets/projects/reel_saver.webp',
    liveUrl: 'https://github.com/sujaypaul27/reel_Saver/releases',
    githubUrl: 'https://github.com/sujaypaul27/reel_Saver',
    year: '2025',
  },
  {
    id: 'vel-symbolism',
    title: 'VEL Symbolism',
    category: 'Frontend Web Design',
    shortDesc:
      'Interactive college symbolism and cultural showcase website deployed on Vercel.',
    fullDesc:
      'Clean, responsive frontend web architecture highlighting institutional heritage, layout choreography, and modern deployment workflows.',
    tags: ['#HTML', '#CSS', '#WebDevelopment', '#Frontend', '#Vercel'],
    image: '/assets/projects/vel.webp',
    liveUrl: 'https://vel-fmcwum115-sujaypaul27s-projects.vercel.app/',
    githubUrl: 'https://github.com/sujaypaul27/vel',
    year: '2025',
  },
  {
    id: 'aquaflare-robot',
    title: 'AquaFlare Robot',
    category: 'Embedded Systems & Robotics',
    shortDesc:
      'Autonomous firefighting robot using triple flame sensors, L298N motor driver, and servo-aimed water pump.',
    fullDesc:
      'Detects fire direction via 3-channel flame sensor array, navigates autonomously toward the hazard using DC motors, and actuates a 9V water pump with servo nozzle sweep.',
    tags: ['#Arduino', '#Robotics', '#FlameSensors', '#L298N', '#EmbeddedSystems'],
    image: '/assets/projects/aquaflare.webp',
    liveUrl: 'https://github.com/sujaypaul27/Firefighting-Robot-AquaFlare.git',
    githubUrl: 'https://github.com/sujaypaul27/Firefighting-Robot-AquaFlare.git',
    year: '2025',
  },
  {
    id: 'waste-segregation-bin',
    title: 'Smart Waste Bin',
    category: 'IoT & Automation',
    shortDesc:
      'Automated dry, wet, and metal waste classification and sorting bin using IR sensors and servo rotation.',
    fullDesc:
      'IoT-oriented smart bin prototype that senses incoming waste material properties and rotates multi-compartment drums via precision servo motors.',
    tags: ['#IoT', '#Sensors', '#ServoMotors', '#Automation', '#Sustainability'],
    image: '/assets/projects/wastebin.webp',
    liveUrl: 'https://github.com/sujaypaul27/Automatic-Waste-Segregation-Bin.git',
    githubUrl: 'https://github.com/sujaypaul27/Automatic-Waste-Segregation-Bin.git',
    year: '2025',
  },
];

export const CERTIFICATES_DATA: CertificateItem[] = [
  {
    id: 'oci-genai-prof',
    title: 'Oracle Cloud Infrastructure 2025 Certified Generative AI Professional',
    issuer: 'Oracle University',
    date: 'October 29, 2025',
    credentialId: '323197948OCI25GAIOCP',
    category: 'Certificates',
    tags: ['#OracleCloud', '#GenerativeAI', '#LLMs', '#OCI'],
    image: '/assets/certificates/oracle_genai_professional.webp',
  },
  {
    id: 'oci-ai-foundations',
    title: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate',
    issuer: 'Oracle University',
    date: 'October 21, 2025',
    credentialId: '323197948OCI25AICFA',
    category: 'Certificates',
    tags: ['#OracleCloud', '#AIFoundations', '#MachineLearning', '#Cloud'],
    image: '/assets/certificates/oracle_ai_foundations.webp',
  },
  {
    id: 'infosys-internship',
    title: 'Internship 7.0 (B12): Java Developer – Web Application Project',
    issuer: 'Infosys Springboard',
    date: 'July 1 – August 1, 2026',
    credentialId: 'Verified QR Credential',
    category: 'Internships',
    tags: ['#InfosysSpringboard', '#JavaFullStack', '#SpringBoot', '#React'],
    image: '/assets/certificates/infosys_springboard.webp',
  },
  {
    id: 'qualcomm-arduino-ai',
    title: 'AI Upskilling Certificate: Hands-On Development from Model to App',
    issuer: 'Qualcomm Academy & Arduino',
    date: 'August 10, 2026',
    credentialId: 'U7D8P7BRKV',
    category: 'Certificates',
    tags: ['#Qualcomm', '#Arduino', '#EdgeAI', '#ModelDeployment'],
    image: '/assets/certificates/qualcomm_arduino_ai.webp',
  },
  {
    id: 'qualcomm-ai-foundation',
    title: 'AI Upskilling Certificate: Technical Foundation',
    issuer: 'Qualcomm Academy',
    date: 'August 10, 2026',
    credentialId: '1qeYUORluz',
    category: 'Certificates',
    tags: ['#Qualcomm', '#AIFoundation', '#DeepLearning'],
    image: '/assets/certificates/qualcomm_ai_foundation.webp',
  },
  {
    id: 'nptel-iot',
    title: 'NPTEL Elite: Introduction to Internet of Things',
    issuer: 'IIT Kharagpur (MoE, Govt. of India)',
    date: 'Jul–Oct 2025 (12 Weeks)',
    credentialId: 'NPTEL25CS147S953905299',
    score: '70% (Elite)',
    category: 'Certificates',
    tags: ['#NPTEL', '#IITKharagpur', '#IoT', '#Elite'],
    image: '/assets/certificates/nptel_iot.webp',
  },
  {
    id: 'nptel-sensors',
    title: 'NPTEL Elite: Sensors and Actuators',
    issuer: 'IISc Bangalore (MoE, Govt. of India)',
    date: 'Jan–Apr 2026 (12 Weeks)',
    credentialId: 'NPTEL26EE13S485702309',
    score: '61% (Elite)',
    category: 'Certificates',
    tags: ['#NPTEL', '#IIScBangalore', '#Sensors', '#Actuators'],
    image: '/assets/certificates/nptel_sensors_actuators.webp',
  },
  {
    id: 'nptel-soft-skills',
    title: 'NPTEL Elite: Soft Skill Development',
    issuer: 'IIT Kharagpur (MoE, Govt. of India)',
    date: 'Jan–Mar 2025 (8 Weeks)',
    credentialId: 'NPTEL25HS72S643311780',
    score: '71% (Elite)',
    category: 'Certificates',
    tags: ['#NPTEL', '#IITKharagpur', '#Communication', '#Leadership'],
    image: '/assets/certificates/nptel_soft_skills.webp',
  },
];

export const TIMELINE_DATA: TimelineItem[] = [
  {
    id: 'exp-infosys',
    period: 'Jul 2026 – Aug 2026',
    title: 'Java Full-Stack Intern (Virtual Internship 7.0)',
    organization: 'Infosys Springboard',
    location: 'Remote',
    type: 'experience',
    highlights: [
      'Built the React frontend for SkillSphere Nexus, an employee skill-management and learning platform with dedicated HR and employee workflows, integrated with Java Spring Boot REST APIs.',
      'Implemented skill verification, learning analytics, assessment tracking, and certification expiry monitoring.',
      'Configured H2 database persistence and validated REST endpoints with Postman and Swagger.',
    ],
  },
  {
    id: 'edu-rmd',
    period: '2024 – 2028 (Expected)',
    title: 'B.E. Electronics & Communication Engineering (Telecommunication)',
    organization: 'R.M.D. Engineering College (Autonomous)',
    location: 'Tiruvallur / Chennai, Tamil Nadu',
    type: 'education',
    highlights: [
      'Current: 3rd Year (5th Semester) | CGPA: 8.02 / 10',
      'Specializing in Telecommunication while building a strong software engineering portfolio across Java backend, full-stack web, and embedded IoT.',
    ],
  },
  {
    id: 'edu-school',
    period: 'Grades 3 – 12',
    title: 'Higher Secondary (Class 12) & Secondary (Class 10)',
    organization: 'Sri Venkateshwara Matric Hr. Sec. School',
    location: 'Chennai, Tamil Nadu',
    type: 'education',
    highlights: [
      'Class 12 Percentage: 85.83%',
      'Class 10 Percentage: 87.80%',
    ],
  },
];

export const SKILLS_PANELS = [
  {
    title: 'Backend & Systems Engineering',
    description:
      'Designing reliable Java backends, RESTful microservices, relational schemas, and cloud-ready deployments.',
    groups: [
      {
        label: 'LANGUAGES & CORE',
        items: ['Java (Core, OOP, Collections)', 'Python', 'C++', 'SQL', 'JavaScript (ES6+)'],
      },
      {
        label: 'BACKEND & DATABASES',
        items: ['Spring Boot', 'REST APIs', 'Server-Sent Events (SSE)', 'Relational SQL', 'H2 Database', 'Maven'],
      },
      {
        label: 'CLOUD, AI & IOT',
        items: ['Oracle Cloud Infrastructure (OCI)', 'Generative AI & LLMs', 'Zoho Catalyst', 'Arduino & Embedded Sensors'],
      },
    ],
  },
  {
    title: 'Full-Stack, Frontend & Tooling',
    description:
      'Building responsive React interfaces, interactive 3D web experiences, mobile apps, and rigorous API test suites.',
    groups: [
      {
        label: 'FRONTEND & MOBILE',
        items: ['React.js', 'Vite', 'TypeScript', 'HTML5 & CSS3', 'Tailwind CSS', 'Dart (Mobile)'],
      },
      {
        label: 'DEVELOPER TOOLS & TESTING',
        items: ['Git & GitHub', 'Postman', 'Swagger / OpenAPI', 'IntelliJ IDEA', 'VS Code'],
      },
      {
        label: 'ALGORITHMS & PROBLEM SOLVING',
        items: ['Data Structures & Algorithms', 'LeetCode (1,316 Rating)', 'Codeforces', 'AtCoder'],
      },
    ],
  },
];
