export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export function vector2(x: number, y: number): Vector2 {
  return { x, y };
}

export function vector2Equals(a: Vector2, b: Vector2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function vector2Distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function vector2ManhattanDistance(a: Vector2, b: Vector2): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

export function vector2HashCode(v: Vector2): number {
  return v.x * 73856093 ^ v.y * 19349663;
}

export const Vector2Zero: Vector2 = { x: 0, y: 0 };
