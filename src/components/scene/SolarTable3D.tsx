import React, { useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { SolarTable, SolarPanel } from '../../types';
import { PANEL_WIDTH, PANEL_LENGTH, PANEL_SPACING, TABLE_CLEARANCE } from '../../utils/shadow';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';


interface SolarTable3DProps {
  table: SolarTable;
}

interface PanelProps {
  panel: SolarPanel;
  localX: number;
  localZ: number;
}

const Panel3D: React.FC<PanelProps> = ({ panel, localX, localZ }) => {
  const isShaded = panel.shadedPercentage > 0;
  
  // Create local sample points buffer attributes once
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(100 * 3);
    const col = new Float32Array(100 * 3);
    const gridSize = 10;
    
    let idx = 0;
    for (let r = 0; r < gridSize; r++) {
      // v from -PANEL_LENGTH/2 to PANEL_LENGTH/2
      const v = -PANEL_LENGTH / 2 + ((r + 0.5) / gridSize) * PANEL_LENGTH;
      
      for (let c = 0; c < gridSize; c++) {
        // u from -PANEL_WIDTH/2 to PANEL_WIDTH/2
        const u = -PANEL_WIDTH / 2 + ((c + 0.5) / gridSize) * PANEL_WIDTH;
        
        // Position on panel surface (slightly hovered to prevent z-fighting)
        pos[idx * 3] = u;
        pos[idx * 3 + 1] = 0.04; // hover above cell
        pos[idx * 3 + 2] = v;
        
        // Color initially green
        col[idx * 3] = 0.1;
        col[idx * 3 + 1] = 0.9;
        col[idx * 3 + 2] = 0.1;
        
        idx++;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  // Update points colors dynamically based on shadedFlags
  const updatedColors = useMemo(() => {
    const col = new Float32Array(colors);
    for (let i = 0; i < 100; i++) {
      const shaded = panel.shadedFlags[i];
      if (shaded) {
        // Red
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.15;
        col[i * 3 + 2] = 0.15;
      } else {
        // Bright green / neon green
        col[i * 3] = 0.1;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 0.3;
      }
    }
    return col;
  }, [panel.shadedFlags, colors]);

  return (
    <group position={[localX, 0, localZ]}>
      {/* 1. Aluminum Frame (Silver Outer Box) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[PANEL_WIDTH, 0.04, PANEL_LENGTH]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Solar Cell Silicon Face (Dark Blue Inner Box) */}
      <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[PANEL_WIDTH - 0.03, 0.03, PANEL_LENGTH - 0.03]} />
        <meshPhysicalMaterial
          color={isShaded ? '#0b1625' : '#0c2240'} // Darker if shaded
          roughness={0.1}
          metalness={0.6}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 3. Panel Shading Overlay - Soft red tint if partially shaded */}
      {panel.shadedPercentage > 0 && (
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[PANEL_WIDTH - 0.032, 0.002, PANEL_LENGTH - 0.032]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={Math.min(0.4, (panel.shadedPercentage / 100) * 0.5)}
          />
        </mesh>
      )}

      {/* 4. Analysis Grid Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[updatedColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          vertexColors
          sizeAttenuation={true}
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  );
};

export const SolarTable3D: React.FC<SolarTable3DProps> = ({ table }) => {
  const selectedTableId = useStore((state) => state.selectedTableId);
  const setSelectedTableId = useStore((state) => state.setSelectedTableId);
  const updateTablePosition = useStore((state) => state.updateTablePosition);
  const updateTableElevation = useStore((state) => state.updateTableElevation);
  const isDragging3D = useStore((state) => state.isDragging3D);
  const setIsDragging3D = useStore((state) => state.setIsDragging3D);
  
  const isSelected = selectedTableId === table.id;
  const groupRef = useRef<THREE.Group>(null);

  const tiltRad = (table.tilt * Math.PI) / 180;

  // Local centers matching getPanelSamplePoints
  const colCenters = [
    -(PANEL_WIDTH + PANEL_SPACING),
    0,
    (PANEL_WIDTH + PANEL_SPACING)
  ];
  
  const rowCenters = [
    -(PANEL_LENGTH / 2 + PANEL_SPACING / 2),
    (PANEL_LENGTH / 2 + PANEL_SPACING / 2)
  ];

  const baseHeight = table.elevation - TABLE_CLEARANCE;

  return (
    <>
      <group 
        ref={groupRef}
        position={[table.x, baseHeight, table.y]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTableId(table.id);
        }}
      >
        {/* 1. Structural Racking (Non-tilted base poles) */}
        {/* Left Front Leg (South) */}
        <mesh position={[-1.2, TABLE_CLEARANCE / 2 - 0.1, -0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, TABLE_CLEARANCE - 0.2, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right Front Leg (South) */}
        <mesh position={[1.2, TABLE_CLEARANCE / 2 - 0.1, -0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, TABLE_CLEARANCE - 0.2, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Left Back Leg (North) - Taller to accommodate the 15° tilt */}
        <mesh position={[-1.2, (TABLE_CLEARANCE + 0.5) / 2, 0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, TABLE_CLEARANCE + 0.5, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right Back Leg (North) - Taller */}
        <mesh position={[1.2, (TABLE_CLEARANCE + 0.5) / 2, 0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, TABLE_CLEARANCE + 0.5, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Horizontal Ground Base Bars */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[3.2, 0.04, 2.0]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* 2. Tilted Table Group */}
        {/* Rotated -tiltRad around X-axis. Centered at Y = TABLE_CLEARANCE */}
        <group position={[0, TABLE_CLEARANCE, 0]} rotation={[-tiltRad, 0, 0]}>
          
          {/* Racking Crossbeams underneath panels */}
          <mesh position={[0, -0.04, -0.5]} castShadow>
            <boxGeometry args={[3.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.04, 0.5]} castShadow>
            <boxGeometry args={[3.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Render the 6 Panels */}
          {table.panels.map((panel, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const localX = colCenters[col];
            const localZ = rowCenters[row]; // maps to local Z in the rotated group
            
            return (
              <Panel3D
                key={panel.id}
                panel={panel}
                localX={localX}
                localZ={localZ}
              />
            );
          })}

          {/* Selection highlighting box frame */}
          {isSelected && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3.3, 0.08, 2.15]} />
              <meshBasicMaterial
                color="#10b981"
                wireframe
                transparent
                opacity={0.6}
              />
            </mesh>
          )}
        </group>
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          showY={true} // Allow horizontal and vertical movement for solar panels (allows roof placing!)
          onChange={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              if (Math.abs(pos.x - table.x) > 0.01 || Math.abs(pos.z - table.y) > 0.01) {
                updateTablePosition(table.id, pos.x, pos.z);
              }
              const targetElevation = pos.y + TABLE_CLEARANCE;
              if (Math.abs(targetElevation - table.elevation) > 0.01) {
                updateTableElevation(table.id, targetElevation);
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
