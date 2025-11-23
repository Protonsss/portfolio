/// <reference types="vite/client" />

// GLSL shader imports
declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module '*.glsl?raw' {
  const value: string;
  export default value;
}

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
  const value: string;
  export default value;
}

// Asset imports
declare module '*.hdr' {
  const value: string;
  export default value;
}

declare module '*.glb' {
  const value: string;
  export default value;
}

declare module '*.gltf' {
  const value: string;
  export default value;
}
