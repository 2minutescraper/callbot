'use client';
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { stationOrigin } from '@/lib/journey';

export const COLORS = {
  bg: '#07080a', charcoal: '#14161a', graphite: '#23262c', slate: '#2f343c',
  white: '#f2efe9', brass: '#b8935a', green: '#4f9a7a', dim: '#5a606a',
};
export const FONT_BOLD = '/fonts/inter-800.ttf';
export const FONT_MED = '/fonts/inter-500.ttf';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Mounts a scene at its station and hides it when the camera is far away. */
export function Stage({ at, range, children }: { at: number; range?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const r = range ?? (journey.mobile ? 1.15 : 1.5);
  useFrame(() => {
    if (g.current) g.current.visible = Math.abs(journey.s - at) < r;
  });
  return <group ref={g} position={stationOrigin(at)}>{children}</group>;
}

type WordProps = {
  children: string;
  size?: number;
  position?: [number, number, number];
  color?: string;
  opacity?: number;
  outline?: boolean;
  font?: string;
  anchorX?: 'left' | 'center' | 'right';
  fade?: [number, number, number, number]; // s ranges in station units: in0,in1,out0,out1
  rotation?: [number, number, number];
};

/** Typography as a physical object: troika text with an optional outline-only "glass" look and scroll-driven fade. */
export function Word3D({ children, size = 4, position = [0, 0, 0], color = COLORS.white, opacity = 1, outline, font = FONT_BOLD, anchorX = 'center', fade, rotation }: WordProps) {
  const ref = useRef<any>(null);
  useFrame(() => {
    const t = ref.current;
    if (!t) return;
    let o = opacity;
    if (fade) o *= smooth(fade[0], fade[1], journey.s) * (1 - smooth(fade[2], fade[3], journey.s));
    t.fillOpacity = outline ? o * 0.1 : o;
    t.strokeOpacity = outline ? o : 0;
    t.visible = o > 0.01;
  });
  return (
    <Text
      ref={ref}
      font={font}
      fontSize={size}
      position={position}
      rotation={rotation}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      letterSpacing={-0.02}
      strokeWidth={outline ? size * 0.006 : 0}
      strokeColor={COLORS.brass}
      material-toneMapped={false}
    >
      {children}
    </Text>
  );
}

/** Small readable label. */
export function Label({ children, position, size = 0.28, color = COLORS.white, anchorX = 'center', opacity = 1, maxWidth }: { children: string; position: [number, number, number]; size?: number; color?: string; anchorX?: 'left' | 'center' | 'right'; opacity?: number; maxWidth?: number }) {
  return (
    <Text font={FONT_MED} fontSize={size} position={position} color={color} anchorX={anchorX} anchorY="middle" fillOpacity={opacity} letterSpacing={0.08} maxWidth={maxWidth} textAlign="center" material-toneMapped={false}>
      {children}
    </Text>
  );
}

export const mat = {
  dark: <meshStandardMaterial color={COLORS.charcoal} roughness={0.6} metalness={0.4} />,
};

/** Dark reflective floor shared by most scenes. */
export function Floor({ size = 200 }: { size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#0b0c0f" roughness={0.45} metalness={0.7} />
    </mesh>
  );
}
