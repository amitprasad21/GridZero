import { Obstacle, Vector3D } from '../types';

export const PANEL_WIDTH = 1.0;  // meters (along horizontal table axis)
export const PANEL_LENGTH = 2.0; // meters (along slope axis)
export const PANEL_SPACING = 0.05; // meters between panels
export const TABLE_CLEARANCE = 0.8; // meters height clearance of the table bottom axis
export const TILT_ANGLE = 15;    // degrees

/**
 * Get the global 3D coordinates of the 100 sampling points on a specific panel of a solar table.
 * 
 * Grid spacing: 10x10.
 * Returns an array of 100 3D vectors.
 */
export function getPanelSamplePoints(
  tableX: number,
  tableZ: number,
  panelIndex: number, // 0 to 5
  tiltDegrees: number = TILT_ANGLE,
  tableElevation: number = TABLE_CLEARANCE
): Vector3D[] {
  // panelIndex mapping (2 rows, 3 columns):
  // Row 0 (bottom/South): panels 0, 1, 2 (left to right)
  // Row 1 (top/North): panels 3, 4, 5 (left to right)
  const col = panelIndex % 3;
  const row = Math.floor(panelIndex / 3);
  
  // Local centers of the 3 columns (X axis)
  const colCenters = [
    -(PANEL_WIDTH + PANEL_SPACING), // Column 0 (Left)
    0,                             // Column 1 (Middle)
    (PANEL_WIDTH + PANEL_SPACING)  // Column 2 (Right)
  ];
  
  // Local centers of the 2 rows (along the tilted slope)
  const rowCenters = [
    -(PANEL_LENGTH / 2 + PANEL_SPACING / 2), // Row 0 (South/Bottom)
    (PANEL_LENGTH / 2 + PANEL_SPACING / 2)  // Row 1 (North/Top)
  ];
  
  const localPanelCenterX = colCenters[col];
  const localPanelCenterY = rowCenters[row]; // Y' in tilted space
  
  const tiltRad = (tiltDegrees * Math.PI) / 180;
  const cosTilt = Math.cos(tiltRad);
  const sinTilt = Math.sin(tiltRad);
  
  const points: Vector3D[] = [];
  const gridSize = 10;
  
  for (let r = 0; r < gridSize; r++) {
    // Percentage from bottom to top of panel: -0.5 to 0.5 of PANEL_LENGTH
    const v = -PANEL_LENGTH / 2 + ((r + 0.5) / gridSize) * PANEL_LENGTH;
    
    for (let c = 0; c < gridSize; c++) {
      // Percentage from left to right of panel: -0.5 to 0.5 of PANEL_WIDTH
      const u = -PANEL_WIDTH / 2 + ((c + 0.5) / gridSize) * PANEL_WIDTH;
      
      // Local coordinates on the tilted table plane
      const localX = localPanelCenterX + u;
      const localSlopeY = localPanelCenterY + v;
      
      // Transform tilted plane coordinates to 3D global coordinates
      // Table is centered at (tableX, tableZ) on the ground
      // X = tableX + localX
      // Y = elevation + Y_offset_from_tilt
      // Z = tableZ + Z_offset_from_tilt (facing South: North is negative Z, so tilt makes North end higher and further North)
      const x = tableX + localX;
      
      // Note: we place the table hinge at the center. 
      // The Y center is tableElevation. As we go North (positive localSlopeY), Y increases and Z decreases (Northwards).
      const y = tableElevation + localSlopeY * sinTilt;
      const z = tableZ - localSlopeY * cosTilt;
      
      points.push({ x, y, z });
    }
  }
  
  return points;
}

/**
 * Check if a ray starting at point P and heading in direction S intersects a building (AABB).
 * Building is defined by:
 * - X in [x - width/2, x + width/2]
 * - Z in [y - length/2, y + length/2]  (Note: obstacle.y is the Z coordinate in 3D)
 * - Y in [0, height]
 */
function intersectRayAABB(P: Vector3D, S: Vector3D, obs: { x: number, y: number, width: number, length: number, height: number }): boolean {
  const xMin = obs.x - obs.width / 2;
  const xMax = obs.x + obs.width / 2;
  const zMin = obs.y - obs.length / 2; // obstacle.y maps to Z
  const zMax = obs.y + obs.length / 2;
  const yMin = 0.0;
  const yMax = obs.height;
  
  let tMin = 0.0001; // Avoid self-intersection / numerical precision errors
  let tMax = 1000.0; // Representing infinity
  
  // Test X slab
  if (Math.abs(S.x) < 1e-8) {
    if (P.x < xMin || P.x > xMax) return false;
  } else {
    const t1 = (xMin - P.x) / S.x;
    const t2 = (xMax - P.x) / S.x;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  
  // Test Y slab
  if (Math.abs(S.y) < 1e-8) {
    if (P.y < yMin || P.y > yMax) return false;
  } else {
    const t1 = (yMin - P.y) / S.y;
    const t2 = (yMax - P.y) / S.y;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  
  // Test Z slab
  if (Math.abs(S.z) < 1e-8) {
    if (P.z < zMin || P.z > zMax) return false;
  } else {
    const t1 = (zMin - P.z) / S.z;
    const t2 = (zMax - P.z) / S.z;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  
  return tMin <= tMax;
}

/**
 * Check if a ray starting at point P and heading in direction S intersects a water tank (cylinder).
 * Cylinder is defined by:
 * - Circular base centered at (x, y) with radius R (Note: obstacle.y is the Z coordinate in 3D)
 * - Height range [0, height]
 */
function intersectRayCylinder(P: Vector3D, S: Vector3D, obs: { x: number, y: number, radius: number, height: number }): boolean {
  const Cx = obs.x;
  const Cz = obs.y; // obstacle.y maps to Z
  const R = obs.radius;
  const H = obs.height;
  
  // Projecting to XZ plane: Solve quadratic equation for intersection with circle
  const vx = P.x - Cx;
  const vz = P.z - Cz;
  
  const a = S.x * S.x + S.z * S.z;
  const b = 2 * (vx * S.x + vz * S.z);
  const c = vx * vx + vz * vz - R * R;
  
  if (Math.abs(a) < 1e-8) {
    // Ray is vertical. Check if point is inside cylinder circle.
    const insideCircle = vx * vx + vz * vz <= R * R;
    if (!insideCircle) return false;
    
    // Vertical ray: check if it goes through the height of the cylinder
    // Since sun is up, S.y is positive. The ray is P.y + t * S.y.
    // It intersects if P.y <= H and S.y > 0 (it will go up and cross H).
    return P.y <= H;
  }
  
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return false; // No intersection with infinite cylinder
  }
  
  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);
  
  // We care about ray going forward (t > 0)
  const tStart = Math.max(0.0001, t1);
  const tEnd = t2;
  
  if (tStart > tEnd) {
    return false; // Cylinder is behind the ray start
  }
  
  // Check if the Y coordinates of the intersection segment overlap with [0, H]
  const yStart = P.y + tStart * S.y;
  const yEnd = P.y + tEnd * S.y;
  
  const yMin = Math.min(yStart, yEnd);
  const yMax = Math.max(yStart, yEnd);
  
  // Overlap test with [0, H]
  return Math.max(yMin, 0.0) <= Math.min(yMax, H);
}

/**
 * Determine if a specific point in 3D space is in shadow due to any of the obstacles.
 */
export function isPointInShadow(point: Vector3D, sunDir: Vector3D, obstacles: Obstacle[]): boolean {
  // If sun is down, everything is in shadow
  if (sunDir.y <= 0.001) {
    return true;
  }
  
  for (const obs of obstacles) {
    if (obs.type === 'building') {
      if (intersectRayAABB(point, sunDir, obs)) {
        return true;
      }
    } else if (obs.type === 'tank') {
      if (intersectRayCylinder(point, sunDir, obs)) {
        return true;
      }
    }
  }
  
  return false;
}
