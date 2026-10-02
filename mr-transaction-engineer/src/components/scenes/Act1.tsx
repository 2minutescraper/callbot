'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { ASSETS, CREDENTIALS } from '@/lib/content';
import { DealViz } from '../DealViz';
import { COLORS, Floor, Label, Word3D, smooth } from '../three-kit';
import type { StrategyGraph } from '@/lib/content';

/* ───────── 01 · THE TRANSACTION ENGINEERING LAB ───────── */
export function Lab() {
  const lid = useRef<THREE.Group>(null);
  useFrame(() => { if (lid.current) lid.current.rotation.x = -smooth(0.55, 1.0, journey.s) * 1.9; });
  const docs: [number, number, number, number][] = [[-2.6, -0.6, 0.25, 1.2], [-3.2, 0.5, -0.18, 1.0], [2.5, 0.7, 0.4, 1.1], [3.1, -0.5, -0.3, 0.9], [-1.2, 1.2, 0.1, 0.8]];
  return (
    <group>
      <Floor />
      {/* architecture: columns + beams recede into darkness */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 17, 9, -i * 9 + 6]}>
              <boxGeometry args={[1.2, 18, 1.2]} /><meshStandardMaterial color={COLORS.graphite} roughness={0.7} metalness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 18, -i * 9 + 6]}><boxGeometry args={[35, 0.6, 0.8]} /><meshStandardMaterial color={COLORS.charcoal} /></mesh>
        </group>
      ))}
      {/* table */}
      <mesh position={[0, 0.78, 0]}><boxGeometry args={[9, 0.2, 4.6]} /><meshStandardMaterial color="#1b1d22" roughness={0.35} metalness={0.6} /></mesh>
      {[[-4.2, -2], [4.2, -2], [-4.2, 2], [4.2, 2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.38, z]}><boxGeometry args={[0.25, 0.76, 0.25]} /><meshStandardMaterial color={COLORS.slate} metalness={0.6} roughness={0.4} /></mesh>
      ))}
      {docs.map(([x, z, r, s], i) => (
        <mesh key={i} position={[x, 0.9, z]} rotation={[-Math.PI / 2, 0, r]}><planeGeometry args={[1.5 * s, 2 * s]} /><meshStandardMaterial color="#d8d3c6" roughness={0.9} /></mesh>
      ))}
      {/* laptop */}
      <group position={[3.3, 0.9, -1.2]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.03, 0]}><boxGeometry args={[1.5, 0.06, 1]} /><meshStandardMaterial color="#2a2d33" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, 0.5, -0.5]} rotation={[-0.25, 0, 0]}><boxGeometry args={[1.5, 0.95, 0.04]} /><meshStandardMaterial color="#111" emissive={COLORS.brass} emissiveIntensity={0.15} /></mesh>
      </group>
      {/* tablet + calculator + coffee + pen */}
      <mesh position={[-3.1, 0.93, -1.0]} rotation={[-Math.PI / 2, 0, 0.3]}><boxGeometry args={[1.1, 0.8, 0.05]} /><meshStandardMaterial color="#0c0d10" emissive={COLORS.green} emissiveIntensity={0.12} /></mesh>
      <mesh position={[-1.9, 0.95, 1.4]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.55, 0.1, 0.8]} /><meshStandardMaterial color="#202228" metalness={0.5} /></mesh>
      <mesh position={[1.9, 1.0, 1.4]}><cylinderGeometry args={[0.2, 0.17, 0.3, 20]} /><meshStandardMaterial color="#e9e4d8" roughness={0.5} /></mesh>
      <mesh position={[0.9, 0.9, 1.5]} rotation={[0, 0.9, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 0.7, 8]} /><meshStandardMaterial color={COLORS.brass} metalness={0.9} roughness={0.3} /></mesh>
      {/* the property file */}
      <group position={[0, 0.9, 0]}>
        <mesh position={[0, 0.02, 0]}><boxGeometry args={[1.8, 0.05, 2.3]} /><meshStandardMaterial color="#3a3226" roughness={0.6} /></mesh>
        <group ref={lid} position={[0, 0.05, -1.15]}>
          <mesh position={[0, 0.02, 1.15]}><boxGeometry args={[1.8, 0.04, 2.3]} /><meshStandardMaterial color={COLORS.brass} roughness={0.5} metalness={0.5} emissive={COLORS.brass} emissiveIntensity={0.08} /></mesh>
        </group>
        <pointLight position={[0, 1.6, 0]} intensity={6} distance={7} color="#ffd9a0" />
      </group>
      <pointLight position={[0, 9, 3]} intensity={220} distance={40} color="#ffe6bf" />
    </group>
  );
}

/* ───────── 02 · THE OPPORTUNITY — property → layers of a transaction ───────── */
const LAYERS = ['PROPERTY', 'MORTGAGE', 'SELLER', 'EQUITY', 'PAYMENT', 'CASH FLOW', 'TERMS', 'DEBT', 'EXIT STRATEGY'];
export function Opportunity() {
  const house = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const labels = useRef<any[]>([]);
  useFrame(({ clock }) => {
    const e = smooth(0.92, 1.5, journey.s);
    if (house.current) house.current.rotation.y = -0.5 + (journey.reduced ? 0 : clock.elapsedTime * 0.04) + e * 0.4;
    mats.current.forEach((m) => { m.opacity = 1 - 0.8 * e; });
    LAYERS.forEach((_, i) => {
      const g = slabs.current[i]; if (!g) return;
      const a = (i / LAYERS.length) * Math.PI * 2 - Math.PI / 2;
      const r = 1 + e * 5.2;
      g.position.set(Math.cos(a) * r * 1.15, 2 + e * (Math.sin(a) * 2.2 + 1.2), Math.sin(a) * r * 0.5 + e * 1.5);
      g.scale.setScalar(0.05 + e * 0.95);
      const t = labels.current[i]; if (t) { t.fillOpacity = e; t.visible = e > 0.02; }
    });
  });
  const m = (c: string) => <meshStandardMaterial ref={(el) => { if (el) mats.current.push(el); }} color={c} transparent roughness={0.6} metalness={0.2} />;
  return (
    <group position={[5, 0, -14]} scale={1.6}>
      <Floor />
      <group ref={house}>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[4.4, 2.4, 3.2]} />{m('#cfc9ba')}</mesh>
        {[-1, 1].map((sd) => (<mesh key={sd} position={[sd * 1.1, 3.0, 0]} rotation={[0, 0, -sd * 0.5]}><boxGeometry args={[2.7, 0.14, 3.6]} />{m('#3a342b')}</mesh>))}
        <mesh position={[0, 0.95, 1.61]}><boxGeometry args={[0.7, 1.5, 0.05]} />{m('#2a2218')}</mesh>
        {[-1.4, 1.4].map((x) => (<mesh key={x} position={[x, 1.5, 1.61]}><boxGeometry args={[0.9, 0.8, 0.05]} /><meshStandardMaterial color="#ffd9a0" emissive="#ffb866" emissiveIntensity={0.9} /></mesh>))}
      </group>
      {LAYERS.map((name, i) => (
        <group key={name} ref={(el) => { slabs.current[i] = el; }}>
          <mesh><boxGeometry args={[2.2, 0.9, 0.06]} /><meshStandardMaterial color={COLORS.graphite} emissive={i === 5 ? COLORS.green : COLORS.brass} emissiveIntensity={0.18} metalness={0.7} roughness={0.3} transparent opacity={0.85} /></mesh>
          <Label position={[0, 0, 0.06]} size={0.2}>{name}</Label>
        </group>
      ))}
      <pointLight position={[-4, 6, 6]} intensity={90} color="#ffe2b8" />
    </group>
  );
}

/* ───────── 03 · THE CONVENTIONAL DEAL — rigid gates ───────── */
const GATES = ['BANK', 'CREDIT', 'DOWN PAYMENT', 'FINANCING'];
export function Conventional() {
  const doors = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const o = smooth(2.02, 2.45, journey.s);
    doors.current.forEach((d, i) => { if (d) d.position.y = 2.6 - o * (5.4 - (i % 2) * 0.6); });
  });
  return (
    <group>
      <Floor />
      {/* rigid straight lines */}
      {[-6, -2, 2, 6].map((x) => (<Line key={x} points={[[x, 0.02, 20], [x, 0.02, -40]]} color={COLORS.slate} lineWidth={1} />))}
      {GATES.map((g, i) => {
        const z = -i * 7 + 3;
        return (
          <group key={g} position={[0, 0, z]}>
            {[-3.4, 3.4].map((x) => (<mesh key={x} position={[x, 3, 0]}><boxGeometry args={[0.7, 6, 0.9]} /><meshStandardMaterial color={COLORS.graphite} roughness={0.6} metalness={0.4} /></mesh>))}
            <mesh position={[0, 6.2, 0]}><boxGeometry args={[7.8, 0.7, 0.9]} /><meshStandardMaterial color={COLORS.graphite} roughness={0.6} metalness={0.4} /></mesh>
            <mesh ref={(el) => { doors.current[i] = el; }} position={[0, 2.6, 0]}><boxGeometry args={[6.1, 5.2, 0.25]} /><meshStandardMaterial color="#101114" roughness={0.4} metalness={0.8} emissive="#5a2a2a" emissiveIntensity={0.12} /></mesh>
            <Label position={[0, 6.2, 0.5]} size={0.32}>{g}</Label>
          </group>
        );
      })}
    </group>
  );
}

/* ───────── 04 · STRUCTURE — the system becomes a flexible network ───────── */
const NETWORK: StrategyGraph = {
  nodes: [
    { id: 'seller', kind: 'seller', p: [-4, 1.2] }, { id: 'property', kind: 'property', p: [-1.6, 0.2] },
    { id: 'mortgage', kind: 'mortgage', p: [-2.6, -1.6] }, { id: 'investor', kind: 'investor', p: [0.8, 1.6] },
    { id: 'buyer', kind: 'buyer', p: [4, 1.0] }, { id: 'cashflow', kind: 'cashflow', p: [3, -1.4] },
    { id: 'equity', kind: 'equity', p: [1.2, -1.2] }, { id: 'terms', kind: 'terms', p: [-0.4, 2.4] },
    { id: 'exit', kind: 'exit', p: [5.4, -0.2] },
  ],
  edges: [['seller', 'property'], ['property', 'mortgage'], ['seller', 'terms'], ['terms', 'investor'], ['investor', 'property'], ['investor', 'buyer'], ['buyer', 'cashflow'], ['property', 'equity'], ['equity', 'cashflow'], ['buyer', 'exit'], ['investor', 'equity']],
};
export function Structure() {
  return (
    <group>
      <Floor />
      <Word3D size={9} position={[0, 5, -12]} outline opacity={0.9} fade={[2.6, 3.0, 3.6, 4.0]}>STRUCTURE</Word3D>
      <group position={[0, 3, 0]}><DealViz graph={NETWORK} scale={1.5} depth={1.4} /></group>
    </group>
  );
}

/* ───────── 05 · EDDIE RAYMOND — documentary portrait + monumental credentials ───────── */
function PortraitPanel({ url }: { url: string }) {
  const tex = useTexture(url);
  return <mesh position={[0, 3.2, 0]}><planeGeometry args={[5, 6.2]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
}
export function Eddie() {
  return (
    <group>
      <Floor />
      <group position={[6.5, 0, 0]}>
      <mesh position={[0, 3.2, -0.2]}><boxGeometry args={[5.3, 6.5, 0.2]} /><meshStandardMaterial color={COLORS.charcoal} metalness={0.8} roughness={0.3} emissive={COLORS.brass} emissiveIntensity={0.05} /></mesh>
      {ASSETS.eddiePhoto ? <PortraitPanel url={ASSETS.eddiePhoto} /> : (
        <group position={[0, 3.2, 0]}>
          <Word3D size={2.6} color={COLORS.brass} position={[0, 0.5, 0.05]}>ER</Word3D>
          <Label position={[0, -1, 0.05]} size={0.22}>EDDIE RAYMOND</Label>
        </group>
      )}
      <pointLight position={[-2, 7, 6]} intensity={180} distance={30} color="#ffe6bf" />
      </group>
      {/* the numbers are architecture the camera flies through */}
      <Word3D size={6.5} position={[-1, 3.2, 30]} outline fade={[3.35, 3.7, 99, 100]}>{CREDENTIALS[0].big}</Word3D>
      <Word3D size={5.2} position={[1, 3.0, 20]} outline fade={[3.35, 3.7, 99, 100]}>{CREDENTIALS[1].big}</Word3D>
      <Word3D size={3.2} position={[0, 2.6, 14.4]} outline fade={[3.35, 3.7, 99, 100]}>DEALS</Word3D>
    </group>
  );
}
