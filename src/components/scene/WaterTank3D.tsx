import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { WaterTank } from '../../types';
import { Edges, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface WaterTank3DProps {
  obstacle: WaterTank;
}

export const WaterTank3D: React.FC<WaterTank3DProps> = ({ obstacle }) => {
  const selectedObstacleId = useStore((state) => state.selectedObstacleId);
  const setSelectedObstacleId = useStore((state) => state.setSelectedObstacleId);
  const updateObstacle = useStore((state) => state.updateObstacle);
  const isDragging3D = useStore((state) => state.isDragging3D);
  const setIsDragging3D = useStore((state) => state.setIsDragging3D);
  const theme = useStore((state) => state.theme);
  
  const isSelected = selectedObstacleId === obstacle.id;
  const groupRef = useRef<THREE.Group>(null);

  const h = obstacle.height;
  const r = obstacle.radius;
  const isDark = theme === 'dark';

  // Elevate the main cylinder: it takes up the top 75% of the total height.
  // The bottom 25% is supported by legs.
  const tankHeight = h * 0.75;
  const legHeight = h * 0.25;
  const tankCenterY = legHeight + tankHeight / 2;

  const tankColor = isSelected 
    ? (isDark ? '#0f766e' : '#10b981')
    : (isDark ? '#1e293b' : '#b0b8c4'); // Matte steel metal color vs deep dark slate
  
  const roofColor = isDark ? '#115e59' : '#475569'; // Dark slate lid vs teal accent
  const outlineColor = isSelected ? '#10b981' : (isDark ? '#14b8a6' : '#64748b');

  const handleSelect = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSelectedObstacleId(obstacle.id);
  };

  return (
    <>
      <group
        ref={groupRef}
        position={[obstacle.x, 0, obstacle.y]}
        onClick={handleSelect}
      >
        {/* 1. Main Silo Cylinder (Elevated Tank) */}
        <mesh
          position={[0, tankCenterY, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[r, r, tankHeight, 24]} />
          <meshStandardMaterial
            color={tankColor}
            roughness={0.4}
            metalness={isDark ? 0.8 : 0.6}
            transparent={isDark}
            opacity={isDark ? 0.75 : 1}
          />
          <Edges
            scale={1.002}
            threshold={15}
            color={outlineColor}
            lineWidth={isSelected ? 3 : 1}
          />
        </mesh>

        {/* 2. Conical Top Roof Cover */}
        <mesh
          position={[0, legHeight + tankHeight + (h * 0.08), 0]}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[r * 1.05, h * 0.15, 24]} />
          <meshStandardMaterial
            color={roofColor}
            roughness={0.3}
            metalness={0.7}
          />
          <Edges
            scale={1.002}
            threshold={15}
            color={outlineColor}
            lineWidth={isSelected ? 3 : 1}
          />
        </mesh>

        {/* 3. Four Support Stilts (Legs) */}
        {/* Leg 1: Front-Left */}
        <mesh position={[-r * 0.7, legHeight / 2, -r * 0.7]} castShadow>
          <cylinderGeometry args={[0.05 * r, 0.05 * r, legHeight, 8]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#475569'} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Leg 2: Front-Right */}
        <mesh position={[r * 0.7, legHeight / 2, -r * 0.7]} castShadow>
          <cylinderGeometry args={[0.05 * r, 0.05 * r, legHeight, 8]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#475569'} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Leg 3: Back-Left */}
        <mesh position={[-r * 0.7, legHeight / 2, r * 0.7]} castShadow>
          <cylinderGeometry args={[0.05 * r, 0.05 * r, legHeight, 8]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#475569'} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Leg 4: Back-Right */}
        <mesh position={[r * 0.7, legHeight / 2, r * 0.7]} castShadow>
          <cylinderGeometry args={[0.05 * r, 0.05 * r, legHeight, 8]} />
          <meshStandardMaterial color={isDark ? '#0f172a' : '#475569'} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 4. Silo Side Outlet Pipe Detail */}
        <mesh position={[r * 0.95, h * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.03 * r, 0.03 * r, h * 0.9, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Floating 3D HUD Tooltip */}
        {isSelected && (
          <Html distanceFactor={10} position={[0, h + 0.5, 0]} center>
            <div className="bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/50 rounded-xl px-2.5 py-1.5 shadow-2xl flex flex-col gap-0.5 min-w-[130px] pointer-events-none select-none text-center font-sans">
              <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Active Silo</span>
              <span className="text-xs font-black tracking-tight">{obstacle.name}</span>
              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">[{obstacle.x.toFixed(1)}m, {obstacle.y.toFixed(1)}m]</span>
            </div>
          </Html>
        )}
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          showY={false} // Only horizontal movement for silo
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
