import gsap from 'gsap';

/**
 * Premium easing configurations matching Zentry-level quality
 * These are longer, smoother, and more deliberate than standard web animations
 */

export const premiumEasing = {
    // Primary easing for most animations - very smooth, gentle deceleration
    smooth: 'power2.out', // GSAP: easeOutQuad

    // For elegant entrances - slower, more luxurious
    entrance: 'power3.out', // GSAP: easeOutCubic - Zentry's primary choice

    // For exits - slightly faster but still smooth
    exit: 'power2.in',

    // For complex sequences - balanced in/out
    balanced: 'power2.inOut',

    // For elastic, playful interactions (use sparingly)
    elastic: 'elastic.out(1, 0.5)',

    // For very subtle, almost imperceptible movements
    gentle: 'power4.out', // GSAP: easeOutQuart

    // For emphasis and dramatic reveals
    dramatic: 'expo.out', // GSAP: easeOutExpo - Zentry uses this for big moments
};

/**
 * Premium duration standards (in seconds)
 * Zentry uses generous durations - never rushed
 */
export const premiumDuration = {
    // Micro-interactions (hover, click feedback)
    micro: 0.3,

    // Short animations (button states, small UI changes)
    short: 0.5,

    // Medium animations (card reveals, section fades)
    medium: 0.8, // Zentry's sweet spot

    // Long animations (large transitions, dramatic reveals)
    long: 1.2,

    // Extra long (loading sequences, hero animations)
    extraLong: 1.8,

    // Epic (cinematic moments)
    epic: 2.5,
};

/**
 * Stagger configurations for sequential animations
 */
export const premiumStagger = {
    // Very subtle - barely noticeable delay
    subtle: {
        amount: 0.05,
        from: 'start',
        ease: premiumEasing.smooth,
    },

    // Standard - clear but not slow
    standard: {
        amount: 0.1,
        from: 'start',
        ease: premiumEasing.smooth,
    },

    // Generous - Zentry-style deliberate sequencing
    generous: {
        amount: 0.15,
        from: 'start',
        ease: premiumEasing.entrance,
    },

    // From center outward (for grids, cards)
    radial: {
        amount: 0.1,
        from: 'center',
        grid: 'auto',
        ease: premiumEasing.smooth,
    },
};

/**
 * Premium animation presets - ready-to-use configurations
 */

// Text reveal (character by character or word by word)
export function createTextReveal(options?: {
    duration?: number;
    stagger?: number;
    blur?: boolean;
}): gsap.TweenVars {
    return {
        opacity: 0,
        y: 30,
        filter: options?.blur ? 'blur(10px)' : 'blur(0px)',
        duration: options?.duration || premiumDuration.medium,
        stagger: options?.stagger || 0.03,
        ease: premiumEasing.entrance,
    };
}

// Fade up (sections, cards)
export function createFadeUp(options?: {
    duration?: number;
    distance?: number;
    blur?: boolean;
}): gsap.TweenVars {
    return {
        opacity: 0,
        y: options?.distance || 40,
        filter: options?.blur ? 'blur(8px)' : 'blur(0px)',
        duration: options?.duration || premiumDuration.medium,
        ease: premiumEasing.entrance,
    };
}

// Scale fade (modals, overlays)
export function createScaleFade(options?: {
    duration?: number;
    scale?: number;
}): gsap.TweenVars {
    return {
        opacity: 0,
        scale: options?.scale || 0.95,
        duration: options?.duration || premiumDuration.short,
        ease: premiumEasing.smooth,
    };
}

// 3D card tilt on hover
export function create3DTilt(element: HTMLElement, options?: {
    maxTilt?: number;
    perspective?: number;
}): void {
    const maxTilt = options?.maxTilt || 15;
    const perspective = options?.perspective || 1000;

    element.style.transformStyle = 'preserve-3d';
    element.style.perspective = `${perspective}px`;

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        const rotateX = -(deltaY / rect.height) * maxTilt;
        const rotateY = (deltaX / rect.width) * maxTilt;

        gsap.to(element, {
            rotateX,
            rotateY,
            duration: premiumDuration.micro,
            ease: premiumEasing.smooth,
        });
    });

    element.addEventListener('mouseleave', () => {
        gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: premiumDuration.short,
            ease: premiumEasing.elastic,
        });
    });
}

// Parallax scroll effect
export function createParallax(
    element: HTMLElement,
    speed: number = 0.5
): gsap.core.Tween {
    return gsap.to(element, {
        y: () => window.scrollY * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true, // Smooth scrubbing
        },
    });
}

// Magnetic cursor effect
export function createMagneticEffect(
    element: HTMLElement,
    cursor: HTMLElement,
    strength: number = 0.3
): void {
    element.addEventListener('mouseenter', (_e) => {
        gsap.to(cursor, {
            scale: 1.5,
            duration: premiumDuration.micro,
            ease: premiumEasing.smooth,
        });
    });

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(element, {
            x: deltaX,
            y: deltaY,
            duration: premiumDuration.micro,
            ease: premiumEasing.smooth,
        });
    });

    element.addEventListener('mouseleave', () => {
        gsap.to(cursor, {
            scale: 1,
            duration: premiumDuration.micro,
            ease: premiumEasing.smooth,
        });

        gsap.to(element, {
            x: 0,
            y: 0,
            duration: premiumDuration.short,
            ease: premiumEasing.elastic,
        });
    });
}

// Smooth scroll reveal with blur
export function createScrollReveal(elements: HTMLElement[] | NodeListOf<Element>): void {
    const elementsArray = Array.from(elements);

    elementsArray.forEach((element, index) => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 85%', // Start animation when element is 85% down the viewport
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 60,
            filter: 'blur(10px)',
            duration: premiumDuration.long,
            delay: index * 0.1, // Stagger based on index
            ease: premiumEasing.entrance,
        });
    });
}

/**
 * Timeline builder with premium defaults
 */
export function createPremiumTimeline(options?: gsap.TimelineVars): gsap.core.Timeline {
    return gsap.timeline({
        defaults: {
            duration: premiumDuration.medium,
            ease: premiumEasing.entrance,
        },
        ...options,
    });
}
