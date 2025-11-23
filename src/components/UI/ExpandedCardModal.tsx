import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { projects } from '../../data/projects';
import { skills } from '../../data/skills';
import { playClick, playWhoosh } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';
import { ProjectScene } from './ProjectScene';
import { AnimatedCounter } from './AnimatedCounter';


export function ExpandedCardModal() {
  const expandedCard = useAppStore((state) => state.expandedCard);
  const setExpandedCard = useAppStore((state) => state.setExpandedCard);
  const addRipple = useAppStore((state) => state.addRipple);

  // Find the card data
  const project = projects.find((p) => p.id === expandedCard);
  const skill = skills.find((s) => s.id === expandedCard);
  const data = project || skill;
  const isProject = !!project;

  const handleClose = () => {
    playClick();
    playWhoosh();
    setExpandedCard(null);
    addRipple([0, 0], 0.8);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!data) return null;

  return (
    <AnimatePresence>
      {expandedCard && (
        <motion.div
          className="expanded-card-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={motionSpringPresets.snappy}
            className="glass glass-noise"
            style={{
              width: 'min(800px, 90vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '0',
              background: 'rgba(10, 10, 15, 0.95)',
            }}
          >
            {/* Immersive hero with project scene */}
            <div
              style={{
                position: 'relative',
                height: isProject ? '350px' : '200px',
                background: `linear-gradient(135deg, ${isProject ? project.color : skill?.color}15, transparent)`,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Project Scene Animation */}
              {isProject && <ProjectScene projectId={project.id} color={project.color} />}

              {/* Skill title (fallback for skills) */}
              {!isProject && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '48px',
                    fontWeight: 700,
                    color: skill?.color,
                    opacity: 0.15,
                  }}
                >
                  {skill?.name.split(' ')[0]}
                </div>
              )}

              {/* Close button */}
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                ✕
              </motion.button>

              {/* Color accent */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${isProject ? project.color : skill?.color}, transparent)`,
                }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: '32px' }}>
              {/* Title */}
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                {isProject ? project.title : skill?.name}
              </h2>

              {/* Tagline */}
              <p
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '24px',
                }}
              >
                {isProject ? project.tagline : skill?.description}
              </p>

              {/* Metrics grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {isProject ? (
                  project.metrics.map((metric, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          opacity: 0.6,
                          marginBottom: '4px',
                        }}
                      >
                        {metric.label}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 600,
                        }}
                      >
                        <AnimatedCounter
                          value={metric.value}
                          color={project.color}
                          delay={i * 0.1}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          opacity: 0.6,
                          marginBottom: '4px',
                        }}
                      >
                        Proficiency
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: skill?.color,
                        }}
                      >
                        {skill?.proficiency}%
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          opacity: 0.6,
                          marginBottom: '4px',
                        }}
                      >
                        Experience
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: skill?.color,
                        }}
                      >
                        {skill?.experience}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Long description */}
              {isProject && (
                <div style={{ marginBottom: '24px' }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}
                  >
                    About
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'rgba(255, 255, 255, 0.8)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {project.longDescription}
                  </p>
                </div>
              )}

              {/* Tech stack */}
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '12px',
                  }}
                >
                  {isProject ? 'Tech Stack' : 'Skills'}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {(isProject ? project.techStack : skill?.subskills || []).map(
                    (tech, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 500,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {tech}
                      </motion.span>
                    )
                  )}
                </div>
              </div>

              {/* Skill proficiency bar */}
              {!isProject && skill && (
                <div style={{ marginBottom: '24px' }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}
                  >
                    Proficiency
                  </h3>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.proficiency}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {isProject && project.demoUrl && (
                  <motion.a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${project.color}, ${project.color}aa)`,
                      borderRadius: '10px',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    View Live Demo →
                  </motion.a>
                )}
                {isProject && project.githubUrl && (
                  <motion.a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    🐙 GitHub
                  </motion.a>
                )}
                {isProject && project.caseStudyUrl && (
                  <motion.a
                    href={project.caseStudyUrl}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Read Case Study
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
