export interface Skill {
  id: string;
  name: string;
  proficiency: number; // 0-100
  subskills: string[];
  description: string;
  color: string;
  experience: string;
}

export const skills: Skill[] = [
  {
    id: 'fullstack',
    name: 'Full-Stack Development',
    proficiency: 95,
    subskills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB'],
    description: 'Production-ready web applications with modern frameworks. From responsive frontends to scalable backends, building complete solutions.',
    color: '#4A9EFF',
    experience: '3+ years',
  },
  {
    id: 'ai-ml',
    name: 'AI/ML Integration',
    proficiency: 90,
    subskills: ['OpenAI', 'Claude API', 'Prompt Engineering', 'RAG', 'LangChain', 'Vector DBs'],
    description: 'Enterprise AI systems and automation. Expertise in building production AI applications that solve real problems.',
    color: '#8B5CF6',
    experience: '2+ years',
  },
  {
    id: 'architecture',
    name: 'System Architecture',
    proficiency: 85,
    subskills: ['AWS', 'Database Design', 'API Design', 'Microservices', 'CI/CD', 'Docker'],
    description: 'Building systems that handle real user load. Focus on scalability, reliability, and maintainability.',
    color: '#10B981',
    experience: '2+ years',
  },
  {
    id: 'payments-auth',
    name: 'Payments & Auth',
    proficiency: 92,
    subskills: ['Stripe', 'Supabase Auth', 'OAuth 2.0', 'JWT', 'Security Best Practices'],
    description: 'Production payment systems and authentication. Implemented in revenue-generating applications handling real transactions.',
    color: '#F59E0B',
    experience: '2+ years',
  },
];

export const getSkillById = (id: string): Skill | undefined => {
  return skills.find((s) => s.id === id);
};
