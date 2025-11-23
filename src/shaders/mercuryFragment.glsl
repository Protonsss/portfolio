// Mercury Surface Fragment Shader
// Full implementation with environment reflections and metallic appearance

precision highp float;

uniform float uTime;
uniform vec3 uCameraPosition;
uniform samplerCube uEnvironmentMap;
uniform float uEnvMapIntensity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vReflect;

// Schlick's Fresnel approximation
float fresnelSchlick(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX/Trowbridge-Reitz Normal Distribution Function
float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;

  float num = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = 3.14159265 * denom * denom;

  return num / denom;
}

// Geometry function (Schlick-GGX)
float geometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;

  float num = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return num / denom;
}

// Smith's Geometry function
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometrySchlickGGX(NdotV, roughness);
  float ggx1 = geometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

// Hash function for subtle noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Value noise
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);

  // Mercury base color - silver with subtle blue undertones
  vec3 baseColor = vec3(0.78, 0.78, 0.82);
  vec3 blueShift = vec3(0.72, 0.75, 0.85);

  // Add subtle color variation based on position
  float colorMix = sin(vPosition.x * 2.0 + uTime * 0.3) * 0.5 + 0.5;
  vec3 mercuryColor = mix(baseColor, blueShift, colorMix * 0.3);

  // Metallic properties
  float metallic = 1.0;
  float roughness = 0.05; // Very smooth mercury

  // Fresnel effect - mercury is highly reflective at grazing angles
  float fresnel = fresnelSchlick(max(dot(normal, viewDir), 0.0), 0.95);

  // Environment reflection with distortion
  vec3 reflectDir = reflect(-viewDir, normal);

  // Add slight distortion to reflection based on surface movement
  float distortion = valueNoise(vUv * 20.0 + uTime * 0.2) * 0.05;
  reflectDir.x += distortion;
  reflectDir.z += distortion;
  reflectDir = normalize(reflectDir);

  vec3 envColor = textureCube(uEnvironmentMap, reflectDir).rgb;
  envColor *= uEnvMapIntensity;

  // Apply tone mapping to environment
  envColor = envColor / (envColor + vec3(1.0));
  envColor = pow(envColor, vec3(1.0 / 2.2));

  // Lighting calculations
  vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
  vec3 halfwayDir = normalize(lightDir + viewDir);

  // Cook-Torrance BRDF
  float NDF = distributionGGX(normal, halfwayDir, roughness);
  float G = geometrySmith(normal, viewDir, lightDir, roughness);

  vec3 F0 = vec3(0.95); // High reflectivity for mercury
  vec3 F = F0 + (1.0 - F0) * pow(clamp(1.0 - max(dot(halfwayDir, viewDir), 0.0), 0.0, 1.0), 5.0);

  float NdotL = max(dot(normal, lightDir), 0.0);
  float NdotV = max(dot(normal, viewDir), 0.0);

  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * NdotV * NdotL + 0.0001;
  vec3 specular = numerator / denominator;

  // Combine lighting
  vec3 kD = (vec3(1.0) - F) * (1.0 - metallic);
  vec3 diffuse = kD * mercuryColor / 3.14159265;
  vec3 directLight = (diffuse + specular) * NdotL * vec3(1.0);

  // Blend with environment reflection
  vec3 finalColor = mix(directLight, envColor, fresnel * 0.9);

  // Add specular highlights
  float spec = pow(max(dot(normal, halfwayDir), 0.0), 256.0);
  finalColor += vec3(spec) * 0.5;

  // Rim lighting effect
  float rim = 1.0 - max(dot(normal, viewDir), 0.0);
  rim = pow(rim, 4.0);
  finalColor += rim * vec3(0.2, 0.22, 0.25) * 0.5;

  // Subtle surface variation (micro detail)
  float microDetail = valueNoise(vUv * 100.0 + uTime * 0.5) * 0.03;
  finalColor += microDetail;

  // Color grading - slight blue/teal shift for premium feel
  finalColor.b *= 1.05;
  finalColor.g *= 1.02;

  // Vignette on the surface (darker at edges)
  float dist = length(vPosition.xz);
  float vignette = 1.0 - smoothstep(3.0, 8.0, dist);
  finalColor *= 0.7 + vignette * 0.3;

  gl_FragColor = vec4(finalColor, 1.0);
}
