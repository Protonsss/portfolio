// Glass Head Fragment Shader
// Full implementation with transmission, refraction, chromatic aberration, and subsurface scattering

precision highp float;

uniform float uTime;
uniform float uIOR; // Index of Refraction (1.5 for glass)
uniform float uTransmission;
uniform float uThickness;
uniform float uChromaticAberration;
uniform vec3 uTintColor;
uniform samplerCube uEnvironmentMap;
uniform float uEnvMapIntensity;
uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying float vFresnel;

// Schlick's Fresnel approximation with IOR
float fresnelSchlickIOR(float cosTheta, float ior) {
  float F0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Refract with chromatic aberration
vec3 refractWithDispersion(vec3 viewDir, vec3 normal, float ior, float aberration) {
  // Different IOR for each color channel
  float iorR = ior - aberration;
  float iorG = ior;
  float iorB = ior + aberration;

  vec3 refractedR = refract(-viewDir, normal, 1.0 / iorR);
  vec3 refractedG = refract(-viewDir, normal, 1.0 / iorG);
  vec3 refractedB = refract(-viewDir, normal, 1.0 / iorB);

  return vec3(
    textureCube(uEnvironmentMap, refractedR).r,
    textureCube(uEnvironmentMap, refractedG).g,
    textureCube(uEnvironmentMap, refractedB).b
  );
}

// Simple subsurface scattering approximation
vec3 subsurfaceScattering(vec3 normal, vec3 viewDir, vec3 lightDir, float thickness) {
  // Light wrapping around the object
  vec3 scatterDir = normalize(lightDir + normal * 0.5);
  float scatter = pow(clamp(dot(viewDir, -scatterDir), 0.0, 1.0), 2.0);

  // Depth-based attenuation
  float depthAtten = exp(-thickness * 2.0);

  // Subtle blue/white scatter color
  vec3 scatterColor = vec3(0.6, 0.7, 0.9) * scatter * depthAtten;

  return scatterColor * 0.3;
}

// Internal caustics simulation
float caustics(vec2 uv, float time) {
  vec2 p = uv * 6.0;
  float c = 0.0;

  for(int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 offset = vec2(
      sin(time * 0.3 + fi * 2.0) * 0.5,
      cos(time * 0.4 + fi * 1.5) * 0.5
    );

    float wave1 = sin(p.x * 3.0 + p.y * 2.0 + time + fi);
    float wave2 = sin(p.x * 2.0 - p.y * 3.0 + time * 0.7 + fi);

    c += (wave1 * wave2 + 1.0) * 0.25;

    p *= 1.5;
  }

  return pow(c * 0.3, 2.0) * 0.5;
}

// Hash for noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDir = normalize(vViewDirection);

  // Fresnel effect - glass is more reflective at grazing angles
  float fresnel = fresnelSchlickIOR(max(dot(normal, viewDir), 0.0), uIOR);

  // Reflection
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 reflection = textureCube(uEnvironmentMap, reflectDir).rgb;

  // Refraction with chromatic aberration
  vec3 refraction = refractWithDispersion(viewDir, normal, uIOR, uChromaticAberration);

  // Apply environment intensity
  reflection *= uEnvMapIntensity;
  refraction *= uEnvMapIntensity;

  // Tone mapping
  reflection = reflection / (reflection + vec3(1.0));
  refraction = refraction / (refraction + vec3(1.0));

  // Gamma correction
  reflection = pow(reflection, vec3(1.0 / 2.2));
  refraction = pow(refraction, vec3(1.0 / 2.2));

  // Blend reflection and refraction based on fresnel
  vec3 glassColor = mix(refraction, reflection, fresnel);

  // Apply glass tint
  glassColor *= uTintColor;

  // Add subsurface scattering
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  vec3 sss = subsurfaceScattering(normal, viewDir, lightDir, uThickness);
  glassColor += sss;

  // Add internal caustics
  float causticEffect = caustics(vUv, uTime);
  glassColor += causticEffect * vec3(0.9, 0.95, 1.0) * 0.15;

  // Rim lighting for premium glass edge effect
  float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
  vec3 rimColor = vec3(0.7, 0.8, 1.0) * rim * 0.4;
  glassColor += rimColor;

  // Specular highlights (sharp)
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 512.0);
  glassColor += vec3(spec) * 0.6;

  // Secondary specular (softer)
  vec3 lightDir2 = normalize(vec3(-0.5, 0.5, 1.0));
  vec3 halfDir2 = normalize(lightDir2 + viewDir);
  float spec2 = pow(max(dot(normal, halfDir2), 0.0), 128.0);
  glassColor += vec3(spec2) * 0.2;

  // Very subtle noise for glass imperfections
  float noise = hash(vUv * 1000.0) * 0.015;
  glassColor += noise;

  // Final alpha based on transmission and fresnel
  float alpha = mix(uTransmission, 1.0, fresnel * 0.5);

  // Edge darkening for glass depth
  float edgeDarken = 1.0 - rim * 0.2;
  glassColor *= edgeDarken;

  gl_FragColor = vec4(glassColor, alpha);
}
