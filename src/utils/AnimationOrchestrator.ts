import gsap from 'gsap';

export type AnimationPhase =
    | 'idle'
    | 'assembly'
    | 'spin'
    | 'fall'
    | 'splash'
    | 'settle'
    | 'complete';

export interface AnimationState {
    phase: AnimationPhase;
    progress: number;
    elapsed: number;
    timeline: gsap.core.Timeline | null;
}

export type AnimationCallback = (state: AnimationState) => void;

/**
 * Central orchestrator for complex multi-stage animations
 * Manages GSAP timelines, state transitions, and synchronization
 */
export class AnimationOrchestrator {
    private state: AnimationState;
    private callbacks: Map<AnimationPhase, AnimationCallback[]>;
    private globalTimeline: gsap.core.Timeline | null;
    private debugMode: boolean;
    private startTime: number;

    constructor(debugMode = false) {
        this.state = {
            phase: 'idle',
            progress: 0,
            elapsed: 0,
            timeline: null,
        };
        this.callbacks = new Map();
        this.globalTimeline = null;
        this.debugMode = debugMode;
        this.startTime = 0;

        if (this.debugMode) {
            console.log('[AnimationOrchestrator] Initialized in debug mode');
        }
    }

    /**
     * Create a new master timeline for orchestrating complex sequences
     */
    createTimeline(config?: gsap.TimelineVars): gsap.core.Timeline {
        this.globalTimeline = gsap.timeline({
            ...config,
            onUpdate: () => {
                if (this.globalTimeline) {
                    this.state.progress = this.globalTimeline.progress();
                    this.state.elapsed = performance.now() - this.startTime;
                }
            },
        });

        this.startTime = performance.now();
        this.state.timeline = this.globalTimeline;

        return this.globalTimeline;
    }

    /**
     * Transition to a new animation phase
     */
    setPhase(phase: AnimationPhase) {
        const previousPhase = this.state.phase;
        this.state.phase = phase;

        if (this.debugMode) {
            console.log(`[AnimationOrchestrator] Phase transition: ${previousPhase} → ${phase}`);
            console.log(`[AnimationOrchestrator] Elapsed: ${this.state.elapsed.toFixed(0)}ms`);
        }

        // Trigger callbacks for this phase
        const callbacks = this.callbacks.get(phase);
        if (callbacks) {
            callbacks.forEach(cb => cb(this.state));
        }
    }

    /**
     * Register a callback for a specific phase
     */
    onPhase(phase: AnimationPhase, callback: AnimationCallback) {
        if (!this.callbacks.has(phase)) {
            this.callbacks.set(phase, []);
        }
        this.callbacks.get(phase)!.push(callback);
    }

    /**
     * Add a labeled animation to the timeline
     */
    addAnimation(
        label: string,
        animation: gsap.TweenVars | (() => void),
        position?: gsap.Position
    ) {
        if (!this.globalTimeline) {
            throw new Error('Timeline not created. Call createTimeline() first.');
        }

        this.globalTimeline.add(label);

        if (typeof animation === 'function') {
            this.globalTimeline.call(animation, undefined, position || '+=0');
        } else {
            this.globalTimeline.to({}, { duration: 0.001 }, position || '+=0');
        }

        if (this.debugMode) {
            console.log(`[AnimationOrchestrator] Added animation: ${label} at ${position || 'end'}`);
        }

        return this.globalTimeline;
    }

    /**
     * Create a nested timeline for a specific phase
     */
    createPhaseTimeline(
        phase: AnimationPhase,
        duration: number,
        config?: gsap.TimelineVars
    ): gsap.core.Timeline {
        const timeline = gsap.timeline({
            ...config,
            onStart: () => this.setPhase(phase),
        });

        if (this.globalTimeline) {
            this.globalTimeline.add(timeline);
        }

        if (this.debugMode) {
            console.log(`[AnimationOrchestrator] Created phase timeline: ${phase} (${duration}s)`);
        }

        return timeline;
    }

    /**
     * Play the master timeline
     */
    play() {
        if (!this.globalTimeline) {
            throw new Error('Timeline not created. Call createTimeline() first.');
        }

        this.globalTimeline.play();

        if (this.debugMode) {
            console.log('[AnimationOrchestrator] Playing timeline');
        }
    }

    /**
     * Pause the master timeline
     */
    pause() {
        if (this.globalTimeline) {
            this.globalTimeline.pause();

            if (this.debugMode) {
                console.log('[AnimationOrchestrator] Paused timeline');
            }
        }
    }

    /**
     * Skip to a specific phase
     */
    skipToPhase(phase: AnimationPhase) {
        if (!this.globalTimeline) return;

        // Map phases to approximate timeline progress
        const phaseProgress: Record<AnimationPhase, number> = {
            idle: 0,
            assembly: 0.15,
            spin: 0.4,
            fall: 0.6,
            splash: 0.75,
            settle: 0.9,
            complete: 1,
        };

        this.globalTimeline.progress(phaseProgress[phase]);
        this.setPhase(phase);

        if (this.debugMode) {
            console.log(`[AnimationOrchestrator] Skipped to phase: ${phase}`);
        }
    }

    /**
     * Kill the timeline and reset state
     */
    destroy() {
        if (this.globalTimeline) {
            this.globalTimeline.kill();
            this.globalTimeline = null;
        }

        this.state = {
            phase: 'idle',
            progress: 0,
            elapsed: 0,
            timeline: null,
        };

        this.callbacks.clear();

        if (this.debugMode) {
            console.log('[AnimationOrchestrator] Destroyed');
        }
    }

    /**
     * Get current state
     */
    getState(): AnimationState {
        return { ...this.state };
    }

    /**
     * Create a staggered animation helper
     */
    stagger(
        targets: any[],
        animation: gsap.TweenVars,
        staggerAmount: number = 0.1
    ): gsap.core.Tween {
        return gsap.to(targets, {
            ...animation,
            stagger: staggerAmount,
        });
    }

    /**
     * Create synchronized animations that play together
     */
    sync(animations: (() => gsap.core.Tween | gsap.core.Timeline)[]): gsap.core.Timeline {
        const syncTimeline = gsap.timeline();

        animations.forEach(animFn => {
            syncTimeline.add(animFn(), 0); // All start at position 0
        });

        if (this.globalTimeline) {
            this.globalTimeline.add(syncTimeline);
        }

        return syncTimeline;
    }
}

// Singleton instance for global access
let globalOrchestrator: AnimationOrchestrator | null = null;

export function getGlobalOrchestrator(debugMode = false): AnimationOrchestrator {
    if (!globalOrchestrator) {
        globalOrchestrator = new AnimationOrchestrator(debugMode);
    }
    return globalOrchestrator;
}

export function resetGlobalOrchestrator() {
    if (globalOrchestrator) {
        globalOrchestrator.destroy();
        globalOrchestrator = null;
    }
}
