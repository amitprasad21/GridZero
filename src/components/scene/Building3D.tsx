import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Building } from '../../types';
import { Edges, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

interface Building3DProps {
  obstacle: Building;
}

export const Building3D: React.FC<Building3DProps> = ({ obstacle }) => {
  const selectedObstacleId = useStore((state) => state.selectedObstacleId);
  const setSelectedObstacleId = useStore((state) => state.setSelectedObstacleId);
  const updateObstacle = useStore((state) => state.updateObstacle);
  const isDragging3D = useStore((state) => state.isDragging3D);
  const setIsDragging3D = useStore((state) => state.setIsDragging3D);
  const houseModel = useStore((state) => state.houseModel);
  const theme = useStore((state) => state.theme);
  
  const isSelected = selectedObstacleId === obstacle.id;
  const groupRef = useRef<THREE.Group>(null);

  const w = obstacle.width;
  const h = obstacle.height; // typically 4.0
  const l = obstacle.length;

  const isDark = theme === 'dark';

  // Theme-specific color palettes
  const wallColor = isSelected
    ? (isDark ? '#0f766e' : '#10b981')
    : (isDark ? '#1e293b' : '#f8fafc');
  
  const roofColor = isDark ? '#0f766e' : '#b45309'; // Dark teal vs terracotta brown
  const woodColor = isDark ? '#115e59' : '#78350f'; // Darker teal vs rich wood
  const glassColor = isDark ? '#38bdf8' : '#e0f2fe'; // Neon blue vs sky blue
  const frameColor = isDark ? '#0ea5e9' : '#475569';
  const outlineColor = isSelected ? '#10b981' : (isDark ? '#14b8a6' : '#94a3b8');
  const lightColor = isDark ? '#06b6d4' : '#fbbf24'; // Cyan vs Amber warm light

  const handleSelect = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSelectedObstacleId(obstacle.id);
  };

  // 1. Delhi Flat Roof House (Terrace + Stair Cabin / Barsati)
  const renderFlatRoofHouse = () => {
    const mainHeight = 3.0; // Flat roof floor is at Y = 3.0
    const cabinH = 2.2;
    const cabinW = w * 0.4;
    const cabinL = l * 0.45;

    return (
      <group>
        {/* Main Walls */}
        <mesh position={[0, mainHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, mainHeight, l]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.8}
            metalness={isDark ? 0.3 : 0.05}
            transparent={isDark}
            opacity={isDark ? 0.75 : 1}
          />
          <Edges scale={1.001} color={outlineColor} lineWidth={isSelected ? 3 : 1} />
        </mesh>

        {/* Staircase cabin (Barsati) at North-West corner */}
        <mesh position={[-w * 0.25, mainHeight + cabinH / 2, -l * 0.22]} castShadow receiveShadow>
          <boxGeometry args={[cabinW, cabinH, cabinL]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.8}
            metalness={isDark ? 0.3 : 0.05}
            transparent={isDark}
            opacity={isDark ? 0.75 : 1}
          />
          <Edges scale={1.002} color={outlineColor} lineWidth={isSelected ? 3 : 1} />
        </mesh>
        
        {/* Barsati Roof slab */}
        <mesh position={[-w * 0.25, mainHeight + cabinH + 0.05, -l * 0.22]} castShadow receiveShadow>
          <boxGeometry args={[cabinW + 0.2, 0.1, cabinL + 0.2]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#cbd5e1'} roughness={0.7} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>

        {/* Parapet Railings around roof terrace (height = 0.8) */}
        {/* Left Railing */}
        <mesh position={[-w / 2 + 0.05, mainHeight + 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.8, l]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>
        {/* Right Railing */}
        <mesh position={[w / 2 - 0.05, mainHeight + 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.8, l]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>
        {/* Back Railing */}
        <mesh position={[0, mainHeight + 0.4, -l / 2 + 0.05]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.8, 0.1]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>
        {/* Front Railing (with gap for stairs entrance) */}
        <mesh position={[w * 0.2, mainHeight + 0.4, l / 2 - 0.05]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.6, 0.8, 0.1]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>

        {/* Main Door in Barsati cabin */}
        <mesh position={[-w * 0.25, mainHeight + cabinH * 0.45, -l * 0.22 + cabinL / 2 + 0.01]}>
          <planeGeometry args={[cabinW * 0.5, cabinH * 0.7]} />
          <meshStandardMaterial color={woodColor} roughness={0.8} />
        </mesh>

        {/* Windows */}
        <mesh position={[0, mainHeight * 0.5, l / 2 + 0.01]}>
          <planeGeometry args={[w * 0.3, mainHeight * 0.3]} />
          <meshPhysicalMaterial color={glassColor} roughness={0.1} transmission={0.9} opacity={0.8} transparent />
        </mesh>
      </group>
    );
  };

  // 2. Kerala Traditional Slanted-Tile House (Rural/Coastal style)
  const renderTraditionalHouse = () => {
    const mainHeight = 2.4;
    const roofOverhang = 0.3;

    return (
      <group>
        {/* Main Walls */}
        <mesh position={[0, mainHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.9, mainHeight, l * 0.9]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.9}
            transparent={isDark}
            opacity={isDark ? 0.75 : 1}
          />
          <Edges scale={1.001} color={outlineColor} lineWidth={isSelected ? 3 : 1} />
        </mesh>

        {/* Left Slanted terracotta roof panel */}
        <mesh
          position={[-w / 4, mainHeight + 0.35, 0]}
          rotation={[0, 0, 0.5]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[w / 2 + roofOverhang, 0.12, l + roofOverhang * 2]} />
          <meshStandardMaterial color={roofColor} roughness={0.5} metalness={isDark ? 0.4 : 0.1} />
          <Edges scale={1.002} color={isDark ? outlineColor : '#78350f'} lineWidth={1} />
        </mesh>

        {/* Right Slanted terracotta roof panel */}
        <mesh
          position={[w / 4, mainHeight + 0.35, 0]}
          rotation={[0, 0, -0.5]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[w / 2 + roofOverhang, 0.12, l + roofOverhang * 2]} />
          <meshStandardMaterial color={roofColor} roughness={0.5} metalness={isDark ? 0.4 : 0.1} />
          <Edges scale={1.002} color={isDark ? outlineColor : '#78350f'} lineWidth={1} />
        </mesh>

        {/* Porch / Veranda (Pial) slab at front */}
        <mesh position={[0, 0.1, l / 2 - 0.1]} castShadow receiveShadow>
          <boxGeometry args={[w * 1.1, 0.2, 0.8]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#cbd5e1'} roughness={0.9} />
          <Edges scale={1.001} color={outlineColor} lineWidth={1} />
        </mesh>

        {/* Wooden columns supporting roof overhang on porch */}
        <mesh position={[-w * 0.45, mainHeight / 2 + 0.1, l / 2 + 0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, mainHeight, 8]} />
          <meshStandardMaterial color={woodColor} roughness={0.8} />
        </mesh>
        <mesh position={[w * 0.45, mainHeight / 2 + 0.1, l / 2 + 0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, mainHeight, 8]} />
          <meshStandardMaterial color={woodColor} roughness={0.8} />
        </mesh>

        {/* Traditional Wood Door */}
        <mesh position={[0, mainHeight * 0.4, l * 0.45 + 0.01]}>
          <planeGeometry args={[w * 0.22, mainHeight * 0.75]} />
          <meshStandardMaterial color={woodColor} roughness={0.7} />
        </mesh>
      </group>
    );
  };

  // 3. Bengaluru Modernist Villa (Contemporary Cantilever concrete & glass)
  const renderModernHouse = () => {
    const gfHeight = 2.0;
    const ffHeight = 2.0;
    const totalHeight = gfHeight + ffHeight;

    return (
      <group>
        {/* Ground Floor (Larger dark slate/grey box) */}
        <mesh position={[0, gfHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, gfHeight, l]} />
          <meshStandardMaterial
            color={isDark ? '#1e293b' : '#64748b'}
            roughness={0.5}
            metalness={isDark ? 0.6 : 0.2}
          />
          <Edges scale={1.001} color={outlineColor} lineWidth={isSelected ? 3 : 1} />
        </mesh>

        {/* First Floor (Cantilevered, shifted slightly to front (+Z) and right (+X)) */}
        <mesh position={[0.3, gfHeight + ffHeight / 2, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.9, ffHeight, l * 0.95]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.8}
            metalness={isDark ? 0.4 : 0.1}
          />
          <Edges scale={1.002} color={outlineColor} lineWidth={isSelected ? 3 : 1} />
        </mesh>

        {/* Vertical Wooden accent feature wall on the left side */}
        <mesh position={[-w / 2 - 0.02, totalHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, totalHeight + 0.2, l * 0.5]} />
          <meshStandardMaterial color={woodColor} roughness={0.6} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>

        {/* First floor balcony glass railing */}
        <mesh position={[0.3, gfHeight + 0.45, l * 0.475 + 0.3]}>
          <boxGeometry args={[w * 0.9, 0.9, 0.05]} />
          <meshPhysicalMaterial
            color={glassColor}
            roughness={0.1}
            transmission={0.9}
            opacity={0.5}
            transparent
          />
          <Edges scale={1.001} color={frameColor} lineWidth={2} />
        </mesh>

        {/* Modernist Roof Trim (Thin capping slab) */}
        <mesh position={[0.3, totalHeight + 0.05, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.95, 0.1, l * 1.0]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#1e293b'} roughness={0.4} />
          <Edges scale={1.002} color={outlineColor} lineWidth={1} />
        </mesh>

        {/* Huge Modern Glass window on First Floor */}
        <mesh position={[0.3, gfHeight + ffHeight / 2, l * 0.475 + 0.31]}>
          <planeGeometry args={[w * 0.6, ffHeight * 0.6]} />
          <meshPhysicalMaterial color={glassColor} roughness={0.1} transmission={0.9} opacity={0.75} transparent />
        </mesh>
      </group>
    );
  };

  return (
    <>
      <group
        ref={groupRef}
        position={[obstacle.x, 0, obstacle.y]}
        onClick={handleSelect}
      >
        {/* Dynamic house rendering based on selected store architectural model */}
        {houseModel === 'flat' && renderFlatRoofHouse()}
        {houseModel === 'traditional' && renderTraditionalHouse()}
        {houseModel === 'modern' && renderModernHouse()}

        {/* Ambiance Point Light shining out from the building center */}
        <pointLight
          position={[0, h / 2, 0]}
          color={lightColor}
          intensity={isDark ? 3.5 : 2.0}
          distance={w * 2.5}
          decay={1.2}
        />
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          showY={false} // Only horizontal movement for house
          onChange={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              if (Math.abs(pos.x - obstacle.x) > 0.01 || Math.abs(pos.z - obstacle.y) > 0.01) {
                updateObstacle(obstacle.id, { x: pos.x, y: pos.z });
              }
            }
          }}
          onPointerDown={() => setIsDragging3D(true)}
          onPointerUp={() => setIsDragging3D(false)}
        />
      )}
    </>
  );
};
