import * as THREE from 'three';

/**
 * Metallic mercury fluid shader with:
 * - Dynamic ripple effects
 * - Specular highlights
 * - Flow map deformation
 * - Caustics simulation
 */

export const mercuryVertexShader = `
uniform float time;
uniform sampler2D rippleTexture;
uniform float waveHeight;
uniform float waveFrequency;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vDisplacement;

// Perlin-style noise for organic waves
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  
  vec3 pos = position;
  
  // Procedural waves
  float wave = 0.0;
  wave += sin(pos.x * waveFrequency + time) * 0.5;
  wave += sin(pos.z * waveFrequency * 1.3 + time * 1.2) * 0.3;
  wave += snoise(vec3(pos.x * 2.0, time * 0.5, pos.z * 2.0)) * 0.2;
  
  // Sample ripple texture for impact waves
  vec4 ripple = texture2D(rippleTexture, uv);
  wave += ripple.r * 2.0;
  
  // Apply displacement
  float displacement = wave * waveHeight;
  vDisplacement = displacement;
  pos.y += displacement;
  
  // Recalculate normal for proper lighting
  float offset = 0.01;
  float waveLeft = sin((pos.x - offset) * waveFrequency + time) * 0.5;
  float waveRight = sin((pos.x + offset) * waveFrequency + time) * 0.5;
  float waveBack = sin((pos.z - offset) * waveFrequency + time) * 0.5;
  float waveFront = sin((pos.z + offset) * waveFrequency + time) * 0.5;
  
  vec3 tangent = normalize(vec3(2.0 * offset, waveRight - waveLeft, 0.0));
  vec3 bitangent = normalize(vec3(0.0, waveFront - waveBack, 2.0 * offset));
  vec3 calculatedNormal = normalize(cross(tangent, bitangent));
  
  vNormal = normalize(normalMatrix * calculatedNormal);
  
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const mercuryFragmentShader = `
uniform vec3 baseColor;
uniform vec3 highlightColor;
uniform float metalness;
uniform float roughness;
uniform samplerCube envMap;
uniform float envMapIntensity;
uniform vec3 lightPosition;
uniform float time;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vDisplacement;

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(lightPosition - vWorldPosition);
  
  // Metallic base color
  vec3 F0 = mix(vec3(0.04), baseColor, metalness);
  
  // Fresnel reflection
  float NdotV = max(dot(normal, viewDir), 0.0);
  vec3 fresnel = fresnelSchlick(NdotV, F0);
  
  // Environment reflection
  vec3 reflected = reflect(-viewDir, normal);
  vec3 envColor = textureCube(envMap, reflected).rgb * envMapIntensity;
  
  // Specular highlight (anisotropic for mercury)
  vec3 halfDir = normalize(lightDir + viewDir);
  float NdotH = max(dot(normal, halfDir), 0.0);
  float specular = pow(NdotH, (1.0 - roughness) * 128.0);
  
  // Anisotropic effect (flow lines)
  float aniso = abs(sin(vUv.x * 50.0 + time * 2.0)) * 0.3;
  specular *= (1.0 + aniso);
  
  // Combine lighting
  vec3 color = baseColor * 0.1; // Ambient
  color += envColor * fresnel; // Reflected environment
  color += highlightColor * specular; // Specular highlight
  
  // Add subtle color variation based on displacement
  color += vec3(0.1, 0.15, 0.2) * vDisplacement * 0.5;
  
  // Caustics effect (simplified)
  float caustic = sin(vUv.x * 30.0 + time) * sin(vUv.y * 30.0 + time * 1.3);
  caustic = max(caustic, 0.0) * 0.1;
  color += vec3(caustic);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export interface MercuryShaderUniforms {
    [uniform: string]: THREE.IUniform<any>;
    time: THREE.IUniform<number>;
    baseColor: THREE.IUniform<THREE.Color>;
    highlightColor: THREE.IUniform<THREE.Color>;
    metalness: THREE.IUniform<number>;
    roughness: THREE.IUniform<number>;
    envMap: THREE.IUniform<THREE.CubeTexture | null>;
    envMapIntensity: THREE.IUniform<number>;
    lightPosition: THREE.IUniform<THREE.Vector3>;
    rippleTexture: THREE.IUniform<THREE.Texture | null>;
    waveHeight: THREE.IUniform<number>;
    waveFrequency: THREE.IUniform<number>;
}

/**
 * Create mercury fluid material
 */
export function createMercuryMaterial(
    envMap: THREE.CubeTexture,
    rippleTexture?: THREE.Texture
): THREE.ShaderMaterial {
    const uniforms: MercuryShaderUniforms = {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0xa0a8b0) },
        highlightColor: { value: new THREE.Color(0xffffff) },
        metalness: { value: 1.0 },
        roughness: { value: 0.1 },
        envMap: { value: envMap },
        envMapIntensity: { value: 1.5 },
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        rippleTexture: { value: rippleTexture || null },
        waveHeight: { value: 0.1 },
        waveFrequency: { value: 2.0 },
    };

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: mercuryVertexShader,
        fragmentShader: mercuryFragmentShader,
        side: THREE.DoubleSide,
    });
}

/**
 * Update mercury material animation
 */
export function updateMercuryMaterial(
    material: THREE.ShaderMaterial,
    deltaTime: number,
    options?: {
        waveIntensity?: number;
        scrollVelocity?: number;
    }
) {
    material.uniforms.time.value += deltaTime;

    // Adjust wave height based on scroll or other interactions
    if (options?.scrollVelocity) {
        const targetHeight = 0.1 + Math.abs(options.scrollVelocity) * 0.5;
        material.uniforms.waveHeight.value += (targetHeight - material.uniforms.waveHeight.value) * 0.1;
    }

    if (options?.waveIntensity !== undefined) {
        material.uniforms.waveHeight.value = 0.1 * options.waveIntensity;
    }
}

/**
 * Create ripple texture for impact effects
 */
export function createRippleTexture(size: number = 512): THREE.DataTexture {
    const data = new Uint8Array(size * size);

    // Initialize with flat surface
    for (let i = 0; i < size * size; i++) {
        data[i] = 128; // Middle value (no displacement)
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Add ripple to texture at specific position
 */
export function addRipple(
    texture: THREE.DataTexture,
    x: number,
    y: number,
    strength: number = 1.0,
    radius: number = 0.1
) {
    const size = texture.image.width;
    const data = texture.image.data as Uint8Array;

    const centerX = Math.floor(x * size);
    const centerY = Math.floor(y * size);
    const rippleRadius = Math.floor(radius * size);

    for (let dy = -rippleRadius; dy <= rippleRadius; dy++) {
        for (let dx = -rippleRadius; dx <= rippleRadius; dx++) {
            const px = centerX + dx;
            const py = centerY + dy;

            if (px >= 0 && px < size && py >= 0 && py < size) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= rippleRadius) {
                    const falloff = 1.0 - (dist / rippleRadius);
                    const index = py * size + px;
                    const wave = Math.sin(dist * 0.5) * falloff * strength * 127 + 128;
                    data[index] = Math.max(0, Math.min(255, wave));
                }
            }
        }
    }

    texture.needsUpdate = true;
}
