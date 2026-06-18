import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { Building3D } from './Building3D';
import { WaterTank3D } from './WaterTank3D';
import { SolarTable3D } from './SolarTable3D';
import { getSunDirectionVector, isSunUp, calculateSunPosition } from '../../utils/sun';

export const SceneViewer: React.FC = () => {
  const tables = useStore((state) => state.tables);
  const obstacles = useStore((state) => state.obstacles);
  const simulationMode = useStore((state) => state.simulationMode);
  const manualSun = useStore((state) => state.manualSun);
  const autoDateTimestamp = useStore((state) => state.autoDateTimestamp);
  const selectedLocation = useStore((state) => state.selectedLocation);
  const theme = useStore((state) => state.theme);
  const isDragging3D = useStore((state) => state.isDragging3D);
  const setSelectedObstacleId = useStore((state) => state.setSelectedObstacleId);
  const setSelectedTableId = useStore((state) => state.setSelectedTableId);

  // Get current active sun position
  const activeSunPos = React.useMemo(() => {
    if (simulationMode === 'auto') {
      return calculateSunPosition(
        new Date(autoDateTimestamp),
        selectedLocation.latitude,
        selectedLocation.longitude
      );
    }
    return manualSun;
  }, [simulationMode, manualSun, autoDateTimestamp, selectedLocation]);

  const sunDir = React.useMemo(() => {
    return getSunDirectionVector(activeSunPos.azimuth, activeSunPos.elevation);
  }, [activeSunPos]);

  const sunIsUp = isSunUp(activeSunPos.elevation);

  // Position directional light far away along the sun direction vector
  const lightPosition: [number, number, number] = [
    sunDir.x * 30,
    sunDir.y * 30,
    sunDir.z * 30
  ];

  const bgColor = theme === 'dark' ? '#070a13' : '#f1f5f9';
  const gridColor = theme === 'dark' ? '#115e59' : '#cbd5e1'; // Glowing teal grid vs subtle slate grid
  const groundColor = theme === 'dark' ? '#0c101b' : '#f8fafc';

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      <Canvas
        shadows
        camera={{ position: [-12, 10, 15], fov: 45 }}
        className="w-full h-full"
        onPointerMissed={() => {
          setSelectedObstacleId(null);
          setSelectedTableId(null);
        }}
      >
        <color attach="background" args={[bgColor]} />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          {/* Ambient light is soft and ensures shaded areas are not pitch black */}
          <ambientLight intensity={theme === 'dark' ? 0.35 : 0.6} />
          
          {/* Sun Light casting high quality shadows */}
          {sunIsUp && (
            <>
              <directionalLight
                position={lightPosition}
                intensity={theme === 'dark' ? 1.6 : 1.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={80}
                shadow-camera-left={-12}
                shadow-camera-right={12}
                shadow-camera-top={12}
                shadow-camera-bottom={-12}
                shadow-bias={-0.0006}
              />
              {/* Sun Indicator Sphere in the Sky */}
              <mesh position={[sunDir.x * 25, sunDir.y * 25, sunDir.z * 25]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
              </mesh>
            </>
          )}

          {/* Technical Ground Grid */}
          <Grid
            renderOrder={-1}
            position={[0, -0.01, 0]}
            args={[30, 30]}
            cellSize={1}
            cellThickness={1.0}
            cellColor={gridColor}
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor={gridColor}
            fadeDistance={30}
            infiniteGrid
          />

          {/* Ground Surface Mesh */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
              color={groundColor}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Solar Arrays */}
          {tables.map((table) => (
            <SolarTable3D key={table.id} table={table} />
          ))}

          {/* Obstacles */}
          {obstacles.map((obs) => {
            if (obs.type === 'building') {
              return <Building3D key={obs.id} obstacle={obs} />;
            } else if (obs.type === 'tank') {
              return <WaterTank3D key={obs.id} obstacle={obs} />;
            }
            return null;
          })}

          {/* Glowing Garden Spherical Lamps (matching reference style) */}
          {/* Lamp 1 */}
          <group position={[-8, 0, -4]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[0, 0.6, 0]} color="#fbbf24" intensity={1.5} distance={5} decay={2} />
          </group>

          {/* Lamp 2 */}
          <group position={[8, 0, -4]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[0, 0.6, 0]} color="#fbbf24" intensity={1.5} distance={5} decay={2} />
          </group>

          <OrbitControls
            makeDefault
            enabled={!isDragging3D}
            maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
            minDistance={3}
            maxDistance={40}
          />
        </Suspense>
      </Canvas>

    </div>
  );
};
