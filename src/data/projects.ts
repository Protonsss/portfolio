export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  metrics: {
    label: string;
    value: string;
  }[];
  techStack: string[];
  image: string;
  images?: string[];
  demoUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  color: string;
}

export const projects: Project[] = [
  {
    id: 'creator-os',
    title: 'CreatorOS',
    tagline: 'AI coaching platform partnered with UFC champion',
    description: 'Built full-stack AI coaching platform from scratch that powers elite athlete coaching.',
    longDescription: `CreatorOS is a comprehensive AI-powered coaching platform that revolutionizes how elite athletes receive personalized training guidance.

The platform leverages advanced AI to analyze athlete performance, generate customized training plans, and provide real-time feedback. Built with a focus on scalability and user experience, it handles hundreds of concurrent users while maintaining sub-second response times.

Key achievements include securing a partnership with a UFC champion, generating over $100,000 in revenue, and building a community of 500+ serious athletes who rely on the platform daily.`,
    metrics: [
      { label: 'Revenue', value: '$100,000+' },
      { label: 'Users', value: '500+ athletes' },
      { label: 'Tech Stack', value: 'React, Node.js, OpenAI' },
    ],
    techStack: ['React', 'Node.js', 'OpenAI API', 'Stripe', 'PostgreSQL', 'Redis', 'AWS'],
    image: '/projects/creatorOS.jpg',
    images: [
      '/projects/creatorOS-1.jpg',
      '/projects/creatorOS-2.jpg',
      '/projects/creatorOS-3.jpg',
    ],
    demoUrl: 'https://creatorOS.com',
    caseStudyUrl: '/case-studies/creator-os',
    color: '#4A9EFF',
  },
  {
    id: 'dorothy',
    title: 'Dorothy',
    tagline: 'AI-powered senior tech assistance',
    description: 'Building billion-dollar Y Combinator enterprise for senior technology support.',
    longDescription: `Dorothy is an innovative AI-powered platform designed to bridge the technology gap for seniors. Using computer vision and natural language processing, Dorothy provides real-time, patient assistance for any technology-related task.

The platform uses Claude's advanced AI capabilities to understand context, recognize UI elements through screenshots, and guide users step-by-step through any technical challenge. Unlike traditional tech support, Dorothy adapts to each user's pace and learning style.

Currently in pre-launch phase, targeting Y Combinator for funding to scale this solution to millions of seniors who struggle with daily technology interactions.`,
    metrics: [
      { label: 'Stage', value: 'Pre-launch' },
      { label: 'Target', value: 'Y Combinator' },
      { label: 'Tech Stack', value: 'Computer Vision, Claude API' },
    ],
    techStack: ['Claude API', 'Computer Vision', 'Supabase', 'React Native', 'Python', 'TensorFlow'],
    image: '/projects/dorothy.jpg',
    images: [
      '/projects/dorothy-1.jpg',
      '/projects/dorothy-2.jpg',
    ],
    caseStudyUrl: '/case-studies/dorothy',
    color: '#8B5CF6',
  },
  {
    id: 'mealmate-ads',
    title: 'MealMate Ads',
    tagline: 'Automated advertising for local startup',
    description: 'Developed and manage fully automated ad campaigns achieving 250% ROAS.',
    longDescription: `MealMate Ads is a sophisticated automated advertising system built for a local meal prep startup. The system handles everything from campaign creation to bid optimization without human intervention.

Using custom scripts integrated with Google Ads API, the platform continuously analyzes performance data, adjusts targeting parameters, and reallocates budget to maximize return on ad spend. The automation runs 24/7, making micro-adjustments that would be impossible manually.

The result: a completely hands-off advertising operation that consistently delivers 250% return on ad spend, allowing the startup founders to focus on their core business.`,
    metrics: [
      { label: 'ROAS', value: '250%' },
      { label: 'Automation', value: '100%' },
      { label: 'Tech Stack', value: 'Google Ads API' },
    ],
    techStack: ['Google Ads API', 'Google Analytics', 'Python', 'Google Scripts', 'BigQuery'],
    image: '/projects/mealmate.jpg',
    color: '#10B981',
  },
  {
    id: 'academic',
    title: 'Academic Excellence',
    tagline: 'Zone Champion & CEMC Distinctions',
    description: 'Beaver Computing Champion, CEMC Mathematics awards, targeting UWaterloo CS.',
    longDescription: `A track record of academic excellence in computing and mathematics competitions, demonstrating deep problem-solving abilities and algorithmic thinking.

Achievements include winning the Beaver Computing Challenge zone championship, earning distinctions in CEMC mathematics competitions, and maintaining a rigorous self-study regimen of 6+ hours daily focused on computer science fundamentals.

Currently targeting admission to University of Waterloo's prestigious Computer Science program, with a portfolio that demonstrates both theoretical knowledge and practical application through real-world projects.`,
    metrics: [
      { label: 'Achievement', value: 'Zone Champion' },
      { label: 'Target', value: 'UWaterloo CS' },
      { label: 'Daily Study', value: '6+ hours' },
    ],
    techStack: ['Algorithms', 'Data Structures', 'Mathematics', 'Problem Solving'],
    image: '/projects/academic.jpg',
    color: '#F59E0B',
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};
