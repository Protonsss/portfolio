import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    stagger?: number;
}

/**
 * Zentry-style scroll reveal animation
 * Elements fade in and slide as they enter viewport
 */
export function ScrollReveal({
    children,
    delay = 0,
    direction = 'up',
    stagger = 0
}: ScrollRevealProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        // Set initial state based on direction
        const initialState: any = {
            opacity: 0,
            filter: 'blur(10px)',
        };

        const finalState: any = {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            delay,
        };

        switch (direction) {
            case 'up':
                initialState.y = 60;
                finalState.y = 0;
                break;
            case 'down':
                initialState.y = -60;
                finalState.y = 0;
                break;
            case 'left':
                initialState.x = 60;
                finalState.x = 0;
                break;
            case 'right':
                initialState.x = -60;
                finalState.x = 0;
                break;
        }

        gsap.set(element, initialState);

        // Create scroll trigger
        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                const children = element.children;
                if (children.length > 1 && stagger > 0) {
                    // Staggered animation for multiple children
                    gsap.to(children, {
                        ...finalState,
                        stagger,
                    });
                } else {
                    // Single element animation
                    gsap.to(element, finalState);
                }
            },
        });

        return () => {
            trigger.kill();
        };
    }, [delay, direction, stagger]);

    return <div ref={elementRef}>{children}</div>;
}

interface SplitTextRevealProps {
    children: string;
    delay?: number;
    stagger?: number;
}

/**
 * Character-by-character text reveal
 * Zentry-style premium text animation
 */
export function SplitTextReveal({
    children,
    delay = 0,
    stagger = 0.03
}: SplitTextRevealProps) {
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!textRef.current) return;

        const text = textRef.current;
        const chars = children.split('');

        // Wrap each character in a span
        text.innerHTML = chars
            .map(char => `<span style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        const charElements = text.querySelectorAll('span');

        gsap.set(charElements, {
            opacity: 0,
            y: 20,
            rotateX: -90,
        });

        ScrollTrigger.create({
            trigger: text,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(charElements, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger,
                    delay,
                    ease: 'power3.out',
                });
            },
        });

    }, [children, delay, stagger]);

    return <span ref={textRef}>{children}</span>;
}

/**
 * Parallax scroll effect
 * Elements move at different speeds based on scroll
 */
export function useParallax(speed: number = 0.5) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        gsap.to(element, {
            y: () => window.scrollY * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }, [speed]);

    return elementRef;
}

/**
 * Scale on scroll
 * Element scales up as it enters viewport
 */
export function useScaleReveal(options?: {
    from?: number;
    to?: number;
    duration?: number;
}) {
    const elementRef = useRef<HTMLDivElement>(null);
    const { from = 0.8, to = 1, duration = 1.2 } = options || {};

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        gsap.from(element, {
            scale: from,
            opacity: 0,
            duration,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                once: true,
            },
        });
    }, [from, to, duration]);

    return elementRef;
}

/**
 * Counter animation
 * Numbers count up when scrolled into view
 */
export function useCountUp(target: number, duration: number = 2) {
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        const obj = { value: 0 };

        ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    value: target,
                    duration,
                    ease: 'power2.out',
                    onUpdate: () => {
                        element.textContent = Math.floor(obj.value).toString();
                    },
                });
            },
        });
    }, [target, duration]);

    return elementRef;
}
