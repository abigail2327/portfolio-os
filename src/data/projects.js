// Fallback only — used if the live GitHub fetch fails (offline, rate-limited, blocked).
// Shape matches what utils/github.js normalizes live repos into, so components never
// need to branch on where the data came from.
export const PROJECTS = [
  {
    id: 'geopolitical-risk-oil-predictor',
    name: 'geopolitical-risk-oil-predictor',
    description: 'A data/prediction-modeling project exploring how geopolitical risk factors correlate with oil price movements.',
    language: 'Python',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/geopolitical-risk-oil-predictor',
    defaultBranch: 'main',
  },
  {
    id: 'cogniboost',
    name: 'COGNIBOOST',
    description: 'A multi-page ADHD-awareness site with a mini "Jumping Elmo" game built in.',
    language: 'JavaScript',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/COGNIBOOST',
    defaultBranch: 'main',
  },
  {
    id: 'hospital-management-system',
    name: 'Hospital-Management-System',
    description: 'A hospital management system interface for doctors, patients, and hospital admins.',
    language: 'Java',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/Hospital-Management-System',
    defaultBranch: 'main',
  },
  {
    id: 'figma-mobileapp-meliora',
    name: 'Figma-MobileAppMeliora',
    description: 'A mobile app design and prototype.',
    language: 'Figma',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/Figma-MobileAppMeliora',
    defaultBranch: 'main',
  },
  {
    id: 'smart-campus-digital-twin',
    name: 'Smart_Campus_Digital_Twin',
    description: 'A digital twin concept for a smart campus.',
    language: 'JavaScript',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/Smart_Campus_Digital_Twin',
    defaultBranch: 'main',
  },
  {
    id: 'smartmall-network-automation',
    name: 'SmartMall_Network_Automation',
    description: 'A network automation project for a smart mall environment.',
    language: 'Python',
    topics: [],
    repoUrl: 'https://github.com/abigail2327/SmartMall_Network_Automation',
    defaultBranch: 'main',
  },
];
