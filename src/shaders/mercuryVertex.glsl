// Mercury Surface Vertex Shader
// Full implementation with Perlin noise and multi-ripple system

uniform float uTime;
uniform vec2 uRipples[10];
uniform float uRippleStrengths[10];
uniform float uRippleTimes[10];

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vReflect;

// Permutation table for Perlin noise
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// 3D Perlin noise implementation
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Calculate ripple wave at position
float calculateRipple(vec2 pos, vec2 center, float strength, float time) {
  float dist = distance(pos, center);
  float waveSpeed = 3.0;
  float waveFrequency = 8.0;
  float decay = 0.3;

  float wave = sin(dist * waveFrequency - time * waveSpeed);
  float envelope = exp(-dist * decay) * exp(-time * 0.5);

  return wave * envelope * strength;
}

// Calculate displaced position
vec3 getDisplacedPosition(vec3 pos) {
  vec3 displaced = pos;

  // Ambient waves using Perlin noise (multiple octaves)
  float noise1 = cnoise(vec3(pos.xz * 0.3, uTime * 0.15)) * 0.15;
  float noise2 = cnoise(vec3(pos.xz * 0.6 + 100.0, uTime * 0.2)) * 0.08;
  float noise3 = cnoise(vec3(pos.xz * 1.2 + 200.0, uTime * 0.25)) * 0.04;

  float ambientWave = noise1 + noise2 + noise3;

  // Interactive ripples
  float rippleSum = 0.0;
  for(int i = 0; i < 10; i++) {
    if(uRippleStrengths[i] > 0.01) {
      float rippleAge = uTime - uRippleTimes[i];
      if(rippleAge > 0.0 && rippleAge < 5.0) {
        rippleSum += calculateRipple(pos.xz, uRipples[i], uRippleStrengths[i], rippleAge);
      }
    }
  }

  displaced.y += ambientWave + rippleSum;

  return displaced;
}

// Calculate normal from displacement
vec3 calculateNormal(vec3 pos) {
  float epsilon = 0.01;

  vec3 posX = getDisplacedPosition(pos + vec3(epsilon, 0.0, 0.0));
  vec3 negX = getDisplacedPosition(pos - vec3(epsilon, 0.0, 0.0));
  vec3 posZ = getDisplacedPosition(pos + vec3(0.0, 0.0, epsilon));
  vec3 negZ = getDisplacedPosition(pos - vec3(0.0, 0.0, epsilon));

  vec3 tangent = normalize(posX - negX);
  vec3 bitangent = normalize(posZ - negZ);

  return normalize(cross(bitangent, tangent));
}

void main() {
  vUv = uv;

  // Get displaced position
  vec3 displaced = getDisplacedPosition(position);
  vPosition = displaced;

  // Calculate world position
  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPosition.xyz;

  // Calculate normal for lighting
  vNormal = normalMatrix * calculateNormal(position);

  // Calculate reflection vector for environment mapping
  vec3 worldNormal = normalize(mat3(modelMatrix) * calculateNormal(position));
  vec3 viewDir = normalize(cameraPosition - worldPosition.xyz);
  vReflect = reflect(-viewDir, worldNormal);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
