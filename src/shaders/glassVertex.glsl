// Glass Head Vertex Shader
// Full implementation with proper transforms for refraction

uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying float vFresnel;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normal;

  // Calculate world position
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // World normal for reflections
  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  // View direction for fresnel calculation
  vViewDirection = normalize(cameraPosition - worldPosition.xyz);

  // Pre-calculate fresnel for fragment shader
  float NdotV = max(dot(vWorldNormal, vViewDirection), 0.0);
  vFresnel = pow(1.0 - NdotV, 3.0);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
