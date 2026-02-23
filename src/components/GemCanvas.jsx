import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const Gem = () => {
  const meshRef = useRef();
  const scrollY = useRef(0);

  // Track scroll
  window.addEventListener("scroll", () => {
    scrollY.current = window.scrollY;
  });

  useFrame(() => {
    if (!meshRef.current) return;

    const t = scrollY.current * 0.001;

    // Smooth rotation
    meshRef.current.rotation.y += 0.01;
    meshRef.current.rotation.x = Math.sin(t) * 0.3;

    // Morph shape by scaling vertices
    meshRef.current.scale.set(
      1 + Math.sin(t) * 0.2,
      1 + Math.cos(t * 1.3) * 0.3,
      1 + Math.sin(t * 0.7) * 0.2,
    );
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.5, 0]} />
      <MeshTransmissionMaterial
        thickness={1.2}
        roughness={0}
        transmission={1}
        ior={2.4}
        chromaticAberration={0.05}
        backside
      />
    </mesh>
  );
};

const GemCanvas = () => {
  return (
    <div className="gem-canvas">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Gem />
      </Canvas>
    </div>
  );
};

export default GemCanvas;
