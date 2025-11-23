import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Master scroll choreography for the entire portfolio
 * Coordinates animations between all sections
 */
export function usePortfolioScrollChoreography() {
    useEffect(() => {
        // Smooth scroll behavior
        const lenis = (window as any).lenis;
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }

        // Glass head rotation based on scroll
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                const glassHead = document.querySelector('.glass-head');
                if (glassHead) {
                    const rotation = self.progress * Math.PI * 2;
                    (glassHead as HTMLElement).style.transform = `rotateY(${rotation}rad)`;
                }
            },
        });

        // Particle density changes with scroll depth
        ScrollTrigger.create({
            trigger: '.projects-section',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
            onUpdate: (self) => {
                const particles = document.querySelector('.particles');
                if (particles) {
                    const opacity = 0.3 + self.progress * 0.7;
                    (particles as HTMLElement).style.opacity = opacity.toString();
                }
            },
        });

        // Mercury waves intensify on scroll velocity
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const velocity = Math.abs(self.getVelocity() / 1000);
                const mercury = document.querySelector('.mercury-surface');
                if (mercury) {
                    const intensity = Math.min(0.5 + velocity, 2);
                    mercury.setAttribute('data-intensity', intensity.toString());
                }
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}

/**
 * Pin section during scroll
 * Creates "sticky" sections that hold while content scrolls
 */
export function usePinSection(
    trigger: string,
    options?: {
        start?: string;
        end?: string;
        pin?: boolean;
    }
) {
    useEffect(() => {
        const { start = 'top top', end = 'bottom bottom', pin = true } = options || {};

        const st = ScrollTrigger.create({
            trigger,
            start,
            end,
            pin,
            scrub: true,
        });

        return () => st.kill();
    }, [trigger, options]);
}

/**
 * Horizontal scroll section
 * Creates sideways scrolling panels (Zentry-style)
 */
export function useHorizontalScroll(containerSelector: string) {
    useEffect(() => {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const panels = gsap.utils.toArray(`${containerSelector} .panel`);

        gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 1,
                snap: 1 / (panels.length - 1),
                end: () => `+=${(container as HTMLElement).offsetWidth * panels.length}`,
            },
        });
    }, [containerSelector]);
}
