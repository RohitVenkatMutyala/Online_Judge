import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// This is the component that defines the actual 3D model of the badge
function BadgeModel({ color, text }) {
  const groupRef = useRef();

  // Create the custom hexagonal shape for the badge
  // useMemo ensures the shape is created only once for better performance
  const shape = useMemo(() => {
    const s = 1; // size
    const r = 0.2; // corner radius
    const shape = new THREE.Shape();
    shape.moveTo(s - r, 0);
    shape.quadraticCurveTo(s, 0, s, r);
    shape.lineTo(s, s * 1.5 - r);
    shape.quadraticCurveTo(s, s * 1.5, s - r, s * 1.5);
    shape.lineTo(r, s * 1.5);
    shape.quadraticCurveTo(0, s * 1.5, 0, s * 1.5 - r);
    shape.lineTo(0, r);
    shape.quadraticCurveTo(0, 0, r, 0);
    shape.closePath();
    return shape;
  }, []);

  // Settings for extruding the shape into 3D
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 8,
  }), []);

  // This hook now makes the badge react to mouse movement instead of rotating
  useFrame((state) => {
    if (groupRef.current) {
      // Get the normalized mouse position (-1 to 1)
      const { pointer } = state;
      // Calculate target rotation based on mouse position
      const targetRotationX = (pointer.y * Math.PI) / 8; // Tilt up/down
      const targetRotationY = (-pointer.x * Math.PI) / 8; // Tilt left/right

      // Smoothly move the badge's rotation to the target rotation
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
    }
  });

  return (
    // Center the group so it rotates around its middle
    <group ref={groupRef} position={[-0.5, -0.75, 0]} scale={1.2}>
      <mesh
        // Use an array of materials: the first is for the face, the second is for the bevel (the gold rim)
        material={[
          new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.6, roughness: 0.2 }), // Front/Back Face (dark)
          new THREE.MeshStandardMaterial({ color: '#FFD700', metalness: 0.8, roughness: 0.3 }), // Bevel/Side (gold)
        ]}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
      </mesh>

      {/* The text displayed on the front of the badge */}
      <Text
        position={[0.5, 0.75, 0.2]} // Positioned in the center and front
        fontSize={0.6}
        color={color} // Use the badge color for the text
        anchorX="center"
        anchorY="middle"
        font="/Inter_Bold.woff" // For a nicer font, place a .woff file in your /public folder
      >
        {text}
      </Text>
    </group>
  );
}

// This is the main component that sets up the 3D scene
function Badge3D({ color = '#808080', text = '' }) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      {/* Enhanced lighting for a more premium look */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
      
      <BadgeModel color={color} text={text} />
    </Canvas>
  );
}

export default Badge3D;