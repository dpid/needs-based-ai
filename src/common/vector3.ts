export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function vector3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

export function vector3Equals(a: Vector3, b: Vector3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function vector3Distance(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function vector3HashCode(v: Vector3): number {
  return v.x * 73856093 ^ v.y * 19349663 ^ v.z * 83492791;
}

export const Vector3Zero: Vector3 = { x: 0, y: 0, z: 0 };
