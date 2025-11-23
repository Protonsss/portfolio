import * as THREE from 'three';

/**
 * Advanced glass shader with:
 * - Subsurface scattering
 * - Chromatic aberration
 * - Fresnel reflections
 * - Dynamic environment mapping
 */

export const glassVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const glassFragmentShader = `
uniform vec3 color;
uniform float opacity;
uniform float refractionRatio;
uniform float fresnelBias;
uniform float fresnelScale;
uniform float fresnelPower;
uniform float chromaticAberration;
uniform samplerCube envMap;
uniform float envMapIntensity;
uniform float subsurfaceScattering;
uniform vec3 lightPosition;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Fresnel effect
  float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDir, normal), fresnelPower);
  
  // Environment reflection with chromatic aberration
  vec3 reflected = reflect(-viewDir, normal);
  
  // RGB channels with slight offset for chromatic aberration
  float r = textureCube(envMap, reflected + vec3(chromaticAberration, 0.0, 0.0)).r;
  float g = textureCube(envMap, reflected).g;
  float b = textureCube(envMap, reflected - vec3(chromaticAberration, 0.0, 0.0)).b;
  vec3 envColor = vec3(r, g, b) * envMapIntensity;
  
  // Refraction
  vec3 refracted = refract(-viewDir, normal, refractionRatio);
  vec3 refractColor = textureCube(envMap, refracted).rgb;
  
  // Subsurface scattering (simplified)
  vec3 lightDir = normalize(lightPosition - vWorldPosition);
  float scatter = pow(clamp(dot(-lightDir, normal), 0.0, 1.0), 2.0);
  vec3 scatterColor = color * scatter * subsurfaceScattering;
  
  // Combine effects
  vec3 finalColor = mix(refractColor, envColor, fresnel);
  finalColor = mix(finalColor, color, 0.1); // Tint with base color
  finalColor += scatterColor;
  
  // Edge glow effect
  float edgeGlow = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
  finalColor += color * edgeGlow * 0.3;
  
  gl_FragColor = vec4(finalColor, opacity);
}
`;

export interface GlassShaderUniforms {
    [uniform: string]: THREE.IUniform<any>;
    color: THREE.IUniform<THREE.Color>;
    opacity: THREE.IUniform<number>;
    refractionRatio: THREE.IUniform<number>;
    fresnelBias: THREE.IUniform<number>;
    fresnelScale: THREE.IUniform<number>;
    fresnelPower: THREE.IUniform<number>;
    chromaticAberration: THREE.IUniform<number>;
    envMap: THREE.IUniform<THREE.CubeTexture | null>;
    envMapIntensity: THREE.IUniform<number>;
    subsurfaceScattering: THREE.IUniform<number>;
    lightPosition: THREE.IUniform<THREE.Vector3>;
}

/**
 * Create glass shader material
 */
export function createGlassMaterial(
    envMap: THREE.CubeTexture,
    baseColor: THREE.Color = new THREE.Color(0xc8dcff)
): THREE.ShaderMaterial {
    const uniforms: GlassShaderUniforms = {
        color: { value: baseColor },
        opacity: { value: 0.9 },
        refractionRatio: { value: 0.98 },
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 2.0 },
        chromaticAberration: { value: 0.01 },
        envMap: { value: envMap },
        envMapIntensity: { value: 1.0 },
        subsurfaceScattering: { value: 0.5 },
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
    };

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: glassVertexShader,
        fragmentShader: glassFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

/**
 * Animate glass material properties
 */
export function animateGlassMaterial(
    material: THREE.ShaderMaterial,
    _deltaTime: number,
    options?: {
        pulseSpeed?: number;
        lightRotation?: boolean;
    }
) {
    const time = performance.now() * 0.001;
    const pulseSpeed = options?.pulseSpeed || 1.0;

    // Subtle opacity pulse
    const baseOpacity = 0.9;
    material.uniforms.opacity.value = baseOpacity + Math.sin(time * pulseSpeed) * 0.05;

    // Rotate light for dynamic highlights
    if (options?.lightRotation) {
        const radius = 10;
        material.uniforms.lightPosition.value.x = Math.cos(time * 0.5) * radius;
        material.uniforms.lightPosition.value.z = Math.sin(time * 0.5) * radius;
    }

    // Subtle fresnel variation
    material.uniforms.fresnelPower.value = 2.0 + Math.sin(time * 0.3) * 0.2;
}
