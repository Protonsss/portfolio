import * as THREE from 'three';

export interface ParticleConfig {
    count: number;
    spread: number;
    size: number;
    color: THREE.Color;
    magneticStrength: number;
    dragCoefficient: number;
    gravity: THREE.Vector3;
}

export interface ForceField {
    position: THREE.Vector3;
    strength: number;
    radius: number;
    type: 'attract' | 'repel' | 'vortex';
}

export class ParticlePhysicsSystem {
    private positions: Float32Array;
    private velocities: Float32Array;
    private colors: Float32Array;
    private sizes: Float32Array;
    private lifetimes: Float32Array;
    private targetPositions: Float32Array | null;

    private count: number;
    private forceFields: ForceField[];
    private config: ParticleConfig;

    // Spatial hashing for collision detection (optional)
    private gridSize: number;
    private grid: Map<string, number[]>;

    constructor(config: ParticleConfig) {
        this.count = config.count;
        this.config = config;
        this.forceFields = [];
        this.gridSize = 1.0;
        this.grid = new Map();

        // Initialize arrays
        this.positions = new Float32Array(this.count * 3);
        this.velocities = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);
        this.sizes = new Float32Array(this.count);
        this.lifetimes = new Float32Array(this.count);
        this.targetPositions = null;

        this.initializeParticles();
    }

    /**
     * Initialize particles with random positions in a sphere
     */
    private initializeParticles() {
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // Random position in sphere using spherical coordinates
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = this.config.spread * Math.cbrt(Math.random());

            this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            this.positions[i3 + 2] = radius * Math.cos(phi);

            // Initial velocity (can be zero or slight random motion)
            this.velocities[i3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

            // Color (with some variation)
            const colorVariation = 0.1;
            this.colors[i3] = this.config.color.r + (Math.random() - 0.5) * colorVariation;
            this.colors[i3 + 1] = this.config.color.g + (Math.random() - 0.5) * colorVariation;
            this.colors[i3 + 2] = this.config.color.b + (Math.random() - 0.5) * colorVariation;

            // Size (with variation)
            this.sizes[i] = this.config.size * (0.5 + Math.random() * 0.5);

            // Lifetime
            this.lifetimes[i] = 1.0;
        }
    }

    /**
     * Set target positions for magnetic attraction
     */
    setTargetPositions(targets: Float32Array) {
        if (targets.length !== this.count * 3) {
            console.warn('Target positions count mismatch');
            return;
        }
        this.targetPositions = targets;
    }

    /**
     * Add a force field to the system
     */
    addForceField(field: ForceField) {
        this.forceFields.push(field);
    }

    /**
     * Clear all force fields
     */
    clearForceFields() {
        this.forceFields = [];
    }

    /**
     * Update particle physics
     */
    update(deltaTime: number) {
        // Cap deltaTime to avoid instability
        const dt = Math.min(deltaTime, 0.033); // ~30fps minimum

        // Clear spatial grid
        this.grid.clear();

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            const px = this.positions[i3];
            const py = this.positions[i3 + 1];
            const pz = this.positions[i3 + 2];

            let fx = 0;
            let fy = 0;
            let fz = 0;

            // Apply gravity
            fx += this.config.gravity.x;
            fy += this.config.gravity.y;
            fz += this.config.gravity.z;

            // Magnetic attraction to target positions
            if (this.targetPositions && this.config.magneticStrength > 0) {
                const tx = this.targetPositions[i3];
                const ty = this.targetPositions[i3 + 1];
                const tz = this.targetPositions[i3 + 2];

                const dx = tx - px;
                const dy = ty - py;
                const dz = tz - pz;

                const distSq = dx * dx + dy * dy + dz * dz + 0.001; // Avoid division by zero
                const dist = Math.sqrt(distSq);

                // Spring-like attraction
                const attractionForce = this.config.magneticStrength;
                fx += (dx / dist) * attractionForce;
                fy += (dy / dist) * attractionForce;
                fz += (dz / dist) * attractionForce;
            }

            // Apply force fields
            for (const field of this.forceFields) {
                const dx = field.position.x - px;
                const dy = field.position.y - py;
                const dz = field.position.z - pz;

                const distSq = dx * dx + dy * dy + dz * dz + 0.001;
                const dist = Math.sqrt(distSq);

                if (dist < field.radius) {
                    const strength = field.strength * (1 - dist / field.radius);

                    if (field.type === 'attract') {
                        fx += (dx / dist) * strength;
                        fy += (dy / dist) * strength;
                        fz += (dz / dist) * strength;
                    } else if (field.type === 'repel') {
                        fx -= (dx / dist) * strength;
                        fy -= (dy / dist) * strength;
                        fz -= (dz / dist) * strength;
                    } else if (field.type === 'vortex') {
                        // Tangential force (perpendicular to radial direction)
                        const perpX = -dy;
                        const perpY = dx;
                        fx += perpX * strength;
                        fy += perpY * strength;
                    }
                }
            }

            // Apply drag
            const vx = this.velocities[i3];
            const vy = this.velocities[i3 + 1];
            const vz = this.velocities[i3 + 2];

            fx -= vx * this.config.dragCoefficient;
            fy -= vy * this.config.dragCoefficient;
            fz -= vz * this.config.dragCoefficient;

            // Update velocity (Euler integration)
            this.velocities[i3] += fx * dt;
            this.velocities[i3 + 1] += fy * dt;
            this.velocities[i3 + 2] += fz * dt;

            // Update position
            this.positions[i3] += this.velocities[i3] * dt;
            this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
            this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;

            // Add to spatial grid (for future collision detection)
            const gridKey = this.getGridKey(
                this.positions[i3],
                this.positions[i3 + 1],
                this.positions[i3 + 2]
            );
            if (!this.grid.has(gridKey)) {
                this.grid.set(gridKey, []);
            }
            this.grid.get(gridKey)!.push(i);
        }
    }

    /**
     * Get spatial grid key for a position
     */
    private getGridKey(x: number, y: number, z: number): string {
        const gx = Math.floor(x / this.gridSize);
        const gy = Math.floor(y / this.gridSize);
        const gz = Math.floor(z / this.gridSize);
        return `${gx},${gy},${gz}`;
    }

    /**
     * Create a splash effect from an impact point
     */
    createSplash(
        impactPoint: THREE.Vector3,
        count: number,
        force: number
    ): Float32Array {
        const splashPositions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Random direction with upward bias
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // 0 to 90 degrees (upward)

            splashPositions[i3] = impactPoint.x;
            splashPositions[i3 + 1] = impactPoint.y;
            splashPositions[i3 + 2] = impactPoint.z;

            // Initial velocity - TODO: Store in separate velocity array
            // const vx = Math.sin(phi) * Math.cos(theta) * force;
            // const vy = Math.cos(phi) * force; // Upward
            // const vz = Math.sin(phi) * Math.sin(theta) * force;

            // Store velocity in a separate array or apply immediately
            // (This is simplified - in real implementation you'd track these separately)
        }

        return splashPositions;
    }

    /**
     * Get particle data for rendering
     */
    getPositions(): Float32Array {
        return this.positions;
    }

    getColors(): Float32Array {
        return this.colors;
    }

    getSizes(): Float32Array {
        return this.sizes;
    }

    getCount(): number {
        return this.count;
    }

    /**
     * Reset all particles
     */
    reset() {
        this.initializeParticles();
        this.targetPositions = null;
        this.forceFields = [];
    }
}

/**
 * Generate target positions in the shape of a head
 * This creates a simplified head-like point cloud
 */
export function generateHeadShape(count: number, scale: number = 1.0): Float32Array {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Use parametric equations for a head-like shape
        // Combination of sphere (head) and cylinder (neck)
        const t = i / count;

        if (t < 0.8) {
            // Head portion (slightly oval sphere)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = scale * (0.8 + Math.random() * 0.2);

            positions[i3] = r * Math.sin(phi) * Math.cos(theta) * 0.9; // Narrower on X
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + scale * 0.2; // Offset up
            positions[i3 + 2] = r * Math.cos(phi) * 0.85; // Narrower on Z
        } else {
            // Neck portion
            const theta = Math.random() * Math.PI * 2;
            const radius = scale * 0.3 * (1 - (t - 0.8) * 2); // Taper down
            const height = -scale * (t - 0.8) * 4;

            positions[i3] = radius * Math.cos(theta);
            positions[i3 + 1] = height;
            positions[i3 + 2] = radius * Math.sin(theta);
        }
    }

    return positions;
}
