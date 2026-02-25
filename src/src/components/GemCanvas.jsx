import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  MeshTransmissionMaterial, 
  Environment, 
  Float, 
  PresentationControls,
  ContactShadows,
  Sparkles
} from "@react-three/drei";

/**
 * Realistic Round Brilliant Cut Geometry
 */
const GemGeometry = () => {
  const vertices = new Float32Array([
    0, 1.2, 0,
    1, 0.8, 0,  0.7, 0.8, 0.7,  0, 0.8, 1,  -0.7, 0.8, 0.7,
    -1, 0.8, 0, -0.7, 0.8, -0.7, 0, 0.8, -1, 0.7, 0.8, -0.7,
    1.5, 0, 0,  1.06, 0, 1.06,  0, 0, 1.5, -1.06, 0, 1.06,
    -1.5, 0, 0, -1.06, 0, -1.06, 0, 0, -1.5, 1.06, 0, -1.06,
    0, -1.8, 0
  ]);

  const indices = [
    0, 2, 1,  0, 3, 2,  0, 4, 3,  0, 5, 4,  0, 6, 5,  0, 7, 6,  0, 8, 7,  0, 1, 8,
    1, 2, 10, 1, 10, 9,   2, 3, 11, 2, 11, 10,  3, 4, 12, 3, 12, 11,  4, 5, 13, 4, 13, 12,
    5, 6, 14, 5, 14, 13,  6, 7, 15, 6, 15, 14,  7, 8, 16, 7, 16, 15,  8, 1, 9,  8, 9, 16,
    17, 9, 10,  17, 10, 11,  17, 11, 12,  17, 12, 13,  
    17, 13, 14,  17, 14, 15,  17, 15, 16,  17, 16, 9
  ];

  return <polyhedronGeometry args={[Array.from(vertices), indices, 1.5, 0]} />;
};

const LuxuryGem = () => {
  /** @type {import('react').MutableRefObject<import('three').Mesh | null>} */
  const meshRef = useRef(null);

  // Smooth floating and mouse tracking
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Use delta for frame-independent rotation
    meshRef.current.rotation.y += delta * 0.15; 
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <GemGeometry />
        <MeshTransmissionMaterial
          backside
          backsideThickness={1}
          thickness={2.5}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.05}
          ior={2.417} /* Diamond/Sapphire IOR */
          color="#2563eb" /* Deep Royal Blue */
          roughness={0}
          transmission={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
};

const GemCanvas = () => {
  return (
    <div className="gem-canvas-container">
      <Canvas 
        shadows={{ type: 1 }} // 1 is THREE.PCFShadowMap
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMappingExposure: 1.2 }}
      >
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2.5} castShadow color="#ffffff" />
        <spotLight position={[-10, 5, -10]} angle={0.3} penumbra={1} intensity={1.5} color="#60a5fa" />
        <pointLight position={[0, -5, 5]} intensity={0.8} color="#d4af37" />
        
        <PresentationControls 
          global 
          config={{ mass: 2, tension: 500 }} 
          // @ts-ignore
          snap={{ mass: 4, tension: 1500 }} 
          rotation={[0, 0.3, 0]} 
          polar={[-Math.PI / 3, Math.PI / 3]} 
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <LuxuryGem />
          {/* Subtle magical sparkles around the gem */}
          <Sparkles count={40} scale={4} size={2} speed={0.4} opacity={0.3} color="#d4af37" />
        </PresentationControls>
        
        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} resolution={1024} scale={15} blur={2.5} opacity={0.4} far={10} color="#000000" />
      </Canvas>
    </div>
  );
};

export default GemCanvas;