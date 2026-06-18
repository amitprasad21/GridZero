import * as SunCalc from 'suncalc';
import { LocationPreset, SunPosition, Vector3D } from '../types';

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'New Delhi (North)', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Mumbai (West)', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Bengaluru (South)', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Kolkata (East)', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Chennai (South)', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Ahmedabad (West)', latitude: 23.0225, longitude: 72.5714 },
];

/**
 * Calculate the sun's position (azimuth and elevation in degrees) for a given date and location.
 */
export function calculateSunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const sunPos = SunCalc.getPosition(date, latitude, longitude);
  
  // SunCalc returns altitude (elevation) in radians from horizon (-pi/2 to pi/2)
  // and azimuth in radians from South (negative to East, positive to West)
  const elevation = sunPos.altitude * (180 / Math.PI);
  
  // Convert azimuth to North-clockwise (0 = North, 90 = East, 180 = South, 270 = West)
  let azimuth = (sunPos.azimuth * (180 / Math.PI) + 180) % 360;
  if (azimuth < 0) {
    azimuth += 360;
  }
  
  return {
    azimuth,
    // Sun elevation cannot go below 0 for shading calculations (if below horizon, it is night)
    elevation: Math.max(0, elevation),
  };
}

/**
 * Convert azimuth and elevation angles (in degrees) to a 3D unit vector representing
 * the direction FROM the origin TO the sun.
 * 
 * Coordinate System:
 * - +X points East
 * - +Y points Up
 * - +Z points South (so -Z points North)
 * 
 * Azimuth (0 = North, 90 = East, 180 = South, 270 = West)
 * Elevation (0 = Horizon, 90 = Zenith)
 */
export function getSunDirectionVector(azimuth: number, elevation: number): Vector3D {
  const azimuthRad = (azimuth * Math.PI) / 180;
  const elevationRad = (elevation * Math.PI) / 180;
  
  const cosElev = Math.cos(elevationRad);
  const sinElev = Math.sin(elevationRad);
  
  const x = Math.sin(azimuthRad) * cosElev; // Eastward
  const y = sinElev;                       // Upward
  const z = -Math.cos(azimuthRad) * cosElev; // Northward (-Z)
  
  return { x, y, z };
}

/**
 * Check if the sun is up (elevation > 0).
 */
export function isSunUp(elevation: number): boolean {
  return elevation > 0.01;
}
