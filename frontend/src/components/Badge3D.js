import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';

// This is the component that defines the actual 3D model of the badge
function BadgeModel({ color, text }) {
  // useRef allows us to get a direct reference to the 3D object
  const badgeRef = useRef();

  // useFrame is a hook that runs on every single frame, perfect for animation
  useFrame(() => {
    // Rotate the badge a little bit on each frame around the Y-axis
    if (badgeRef.current) {
      badgeRef.current.rotation.y += 0.01;
    }
  });

  return (
    // A group allows us to move and rotate all objects within it together
    <group ref={badgeRef}>
      {/* The main body of the badge (a flat cylinder) */}
      <mesh>
        <cylinderGeometry args={[1, 1, 0.15, 64]} /> {/* [radiusTop, radiusBottom, height, segments] */}
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* A golden rim for the badge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <torusGeometry args={[1, 0.05, 16, 100]} /> {/* [radius, tubeRadius, radialSegments, tubularSegments] */}
         <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* The text displayed on the front of the badge */}
      <Text
        position={[0, 0, 0.1]} // Slightly in front of the badge
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
}

// This is the main component that sets up the 3D scene
function Badge3D({ color = '#808080', text = '' }) {
  return (
    <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
      {/* Adds soft ambient light to the whole scene */}
      <ambientLight intensity={0.7} />
      {/* Adds a directional light, like the sun */}
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      {/* Adds a point light for highlights */}
      <pointLight position={[-10, -10, -10]} intensity={1} />
      
      {/* The BadgeModel component which contains our 3D objects */}
      <BadgeModel color={color} text={text} />
      
      {/* Optional: OrbitControls allow you to drag and rotate the object manually. We can disable it if we only want auto-rotation. */}
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}

export default Badge3D;