import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../utils/store';
import { playClick, playHover } from '../../utils/audio';
import { motionSpringPresets } from '../../utils/animations';

const socialLinks = [
  { id: 'github', icon: '🐙', label: 'GitHub', url: 'https://github.com/stephenchen' },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com/in/stephenchen' },
  { id: 'twitter', icon: '🐦', label: 'Twitter', url: 'https://twitter.com/stephenchen' },
];

export function ContactPanel() {
  const contactFormOpen = useAppStore((state) => state.contactFormOpen);
  const setContactFormOpen = useAppStore((state) => state.setContactFormOpen);
  const addRipple = useAppStore((state) => state.addRipple);

  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; message?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.message) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message too short (min 10 chars)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    playClick();

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    addRipple([0, 0], 1.0);

    // Reset and close after success animation
    setTimeout(() => {
      setIsSuccess(false);
      setContactFormOpen(false);
      setFormData({ email: '', message: '' });
    }, 2000);
  }, [formData, addRipple, setContactFormOpen]);

  const togglePanel = () => {
    playClick();
    setContactFormOpen(!contactFormOpen);

    if (!contactFormOpen) {
      addRipple([Math.random() - 0.5, Math.random() - 0.5], 0.5);
    }
  };

  const handleSocialClick = (url: string) => {
    playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
      }}
    >
      <AnimatePresence mode="wait">
        {!contactFormOpen ? (
          // Collapsed button
          <motion.button
            key="collapsed"
            onClick={togglePanel}
            onMouseEnter={() => playHover()}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="glass"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            ✉️

            {/* Notification badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #4A9EFF, #8B5CF6)',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              Available
            </motion.div>
          </motion.button>
        ) : (
          // Expanded panel
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={motionSpringPresets.snappy}
            className="glass glass-noise"
            style={{
              width: '360px',
              padding: '24px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Get in Touch</h3>
              <motion.button
                onClick={togglePanel}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                // Success state
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '40px 0',
                    textAlign: 'center',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: '48px', marginBottom: '16px' }}
                  >
                    ✓
                  </motion.div>
                  <p style={{ fontSize: '16px', fontWeight: 500 }}>Message Sent!</p>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>I'll get back to you soon.</p>
                </motion.div>
              ) : (
                // Form
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Email input */}
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4A9EFF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Message textarea */}
                  <div style={{ marginBottom: '16px' }}>
                    <textarea
                      placeholder="Your message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${errors.message ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4A9EFF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.message ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}
                      >
                        {errors.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      background: isSubmitting
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #4A9EFF, #8B5CF6)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isSubmitting ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        ⏳
                      </motion.span>
                    ) : (
                      <>
                        Send Message
                        <span>→</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social links */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {socialLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => handleSocialClick(link.url)}
                  onMouseEnter={() => playHover()}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={link.label}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  {link.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
