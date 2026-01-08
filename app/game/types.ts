export interface FloatingText {
    id: number;
    x: number;
    y: number;
    value: string;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    apexY: number; // The highest point (relative to start)
    landY: number; // The lowest point (relative to start)
    driftX: number; // Horizontal drift
    rotation: number;
}
