'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { FOR_WHO, NOT_FOR, RESOURCES, STRATEGIES, type Strategy } from '@/lib/content';
import { DealViz } from '../DealViz';
import { COLORS, FONT_MED, Floor, Label, Word3D, smooth } from '../three-kit';

/* ───────── THE DEAL ANALYZER — hypothetical numbers moving through a deal ───────── */
const COLS = ['PRICE', 'MORTGAGE', 'PAYMENT', 'CASH', 'CASH FLOW', 'TERMS', 'EXIT'];
export function Analyzer() {
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const nums = useRef<any[]>([]);
  const last = useRef<string[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime; const k = smooth(8.6, 9.4, journey.s);
    COLS.forEach((_, i) => {
      const v = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.6 + i * 1.3 + journey.s * 2.2));
      const b = bars.current[i]; if (b) { b.scale.y = Math.max(0.02, v * 4 * k); b.position.y = (v * 4 * k) / 2 + 0.4; }
      const n = nums.current[i];
      if (n) { const s = i === 5 ? `${(v * 12).toFixed(1)} yrs` : `${Math.round(v * 100)}`; if (last.current[i] !== s) { last.current[i] = s; n.text = s; } n.position.y = v * 4 * k + 1; n.fillOpacity = k; }
    });
  });
  return (
    <group>
      <Floor />
      <mesh position={[0, 3, -1]}><boxGeometry args={[14, 7.4, 0.15]} /><meshStandardMaterial color="#0d0f12" metalness={0.8} roughness={0.3} emissive={COLORS.green} emissiveIntensity={0.05} /></mesh>
      {Array.from({ length: 9 }).map((_, i) => (<Line key={'h' + i} points={[[-6.6, 0.4 + i * 0.8, -0.9], [6.6, 0.4 + i * 0.8, -0.9]]} color={COLORS.slate} lineWidth={1} />))}
      {COLS.map((c, i) => {
        const x = (i - 3) * 1.9;
        return (
          <group key={c} position={[x, 0, 0]}>
            <Line points={[[0, 0.4, -0.9], [0, 6.8, -0.9]]} color={COLORS.slate} lineWidth={1} />
            <mesh ref={(el) => { bars.current[i] = el; }} position={[0, 1, 0]}><boxGeometry args={[0.9, 1, 0.9]} /><meshStandardMaterial color={i === 4 ? COLORS.green : COLORS.brass} emissive={i === 4 ? COLORS.green : COLORS.brass} emissiveIntensity={0.35} metalness={0.6} roughness={0.35} /></mesh>
            <Label position={[0, 0.1, 0.6]} size={0.2}>{c}</Label>
            <Text ref={(el: any) => { nums.current[i] = el; }} font={FONT_MED} fontSize={0.3} position={[0, 1, 0.6]} color={COLORS.white} anchorX="center" anchorY="middle" material-toneMapped={false}>0</Text>
          </group>
        );
      })}
      <Label position={[0, 7.4, -0.8]} size={0.26} color={COLORS.brass}>HYPOTHETICAL ILLUSTRATION - NOT REAL FIGURES</Label>
    </group>
  );
}

/* ───────── THE IMPLEMENTATION ENGINE — clickable resource objects ───────── */
function ResourceShape({ id }: { id: string }) {
  const m = <meshStandardMaterial color={COLORS.graphite} emissive={COLORS.brass} emissiveIntensity={0.25} metalness={0.6} roughness={0.35} />;
  switch (id) {
    case 'assignments': return <group>{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.5 - i * 0.5, 0]}><boxGeometry args={[1.5, 0.35, 0.1]} />{m}</mesh>)}</group>;
    case 'contracts': return <mesh><boxGeometry args={[1.3, 1.7, 0.06]} />{m}</mesh>;
    case 'recordings': return <group>{[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => <mesh key={i} position={[x, 0, 0]}><boxGeometry args={[0.14, 0.4 + ((i * 3) % 4) * 0.3, 0.14]} />{m}</mesh>)}</group>;
    case 'analyzer': return <mesh><boxGeometry args={[1.7, 1.2, 0.08]} />{m}</mesh>;
    default: return <group>{[[-0.5, 0.2], [0.5, 0.3], [0, -0.4], [0, 0.5]].map(([x, y], i) => <mesh key={i} position={[x, y, 0]}><sphereGeometry args={[0.28, 16, 16]} />{m}</mesh>)}</group>;
  }
}
// arranged around, never on, the camera's path (x≈0)
const RES_POS: [number, number, number][] = [[-9, 2.6, -2], [-5.2, 2.8, -9], [5.2, 2.8, -9], [9, 2.6, -2], [0, 7.2, -10]];
export function Implementation({ onSelect }: { onSelect: (id: string) => void }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const k = smooth(9.5, 10.0, journey.s);
    refs.current.forEach((g, i) => {
      if (!g) return;
      const [x, y, z] = RES_POS[i];
      g.position.set(x, y + Math.sin(clock.elapsedTime * 0.5 + i) * 0.15, z);
      g.rotation.y = -Math.sign(x) * 0.5; g.scale.setScalar(k);
    });
  });
  return (
    <group>
      <Floor />
      {RESOURCES.map((r, i) => (
        <group key={r.id} ref={(el) => { refs.current[i] = el; }}>
          <mesh onClick={(e) => { e.stopPropagation(); onSelect(r.id); }} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
            <boxGeometry args={[3.2, 3.2, 1]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <ResourceShape id={r.id} />
          <Label position={[0, -1.7, 0]} size={0.24}>{r.title.toUpperCase()}</Label>
        </group>
      ))}
    </group>
  );
}

/* ───────── THE 3-DAY SUMMIT — one door per day ───────── */
export function SummitDay({ day }: { day: 1 | 2 | 3 }) {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const dots = useRef<THREE.Group>(null);
  const speed = 0.4 + day * 0.35;
  useFrame(({ clock }) => { if (dots.current) dots.current.rotation.y = clock.elapsedTime * 0.12 * speed; if (glow.current) glow.current.opacity = 0.14 + 0.06 * Math.sin(clock.elapsedTime * speed * 2); });
  const sub: Strategy | undefined = STRATEGIES[1];
  return (
    <group>
      <Floor />
      {/* the door */}
      {[-4.2, 4.2].map((x) => (<mesh key={x} position={[x, 5, -6]}><boxGeometry args={[1.6, 10, 1.6]} /><meshStandardMaterial color={COLORS.graphite} metalness={0.5} roughness={0.5} /></mesh>))}
      <mesh position={[0, 10.4, -6]}><boxGeometry args={[10, 1.5, 1.6]} /><meshStandardMaterial color={COLORS.graphite} metalness={0.5} roughness={0.5} /></mesh>
      <mesh position={[0, 5, -6.2]}><planeGeometry args={[6.8, 10]} /><meshBasicMaterial ref={glow} color={day === 3 ? '#e2c48b' : COLORS.brass} transparent opacity={0.3} toneMapped={false} /></mesh>
      <Word3D size={5.2} position={[0, 12.8, -6]} outline>{`DAY ${day}`}</Word3D>
      {day === 1 && (
        <group ref={dots} position={[0, 4, -4]}>
          {Array.from({ length: 9 }).map((_, i) => (<mesh key={i} position={[Math.cos((i / 9) * 6.28) * 2.2, Math.sin((i / 9) * 6.28 * 2) * 1.2, Math.sin((i / 9) * 6.28) * 2.2]}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color={COLORS.brass} toneMapped={false} /></mesh>))}
        </group>
      )}
      {day === 2 && sub && <group position={[0, 4.4, -3]}><DealViz graph={sub.graph} scale={1.1} labels /></group>}
      {day === 3 && (
        <group position={[0, 0, -2]}>
          {[-3, -1, 1, 3].map((x, i) => (
            <group key={x} position={[x * 1.4, 0, 0]}>
              <mesh position={[0, 0.8, 0]}><boxGeometry args={[1.2, 1.6, 1.2]} /><meshStandardMaterial color="#23262c" /></mesh>
              <mesh position={[0, 3 + i * 0.4, 0]}><cylinderGeometry args={[0.05, 0.05, 4 + i * 0.8, 6]} /><meshBasicMaterial color={COLORS.green} toneMapped={false} /></mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

/* ───────── THE DEAL FACTORY — turning opportunities into transactions ───────── */
const STAGES = ['LEAD', 'SELLER', 'PROPERTY', 'MOTIVATION', 'STRATEGY', 'STRUCTURE', 'NEGOTIATION', 'CONTRACT', 'CLOSING', 'CASH FLOW / EXIT'];
export function Factory() {
  const items = useRef<(THREE.Mesh | null)[]>([]);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const COUNT = journey.mobile ? 6 : 12;
  useFrame(({ clock }) => {
    const speed = 5 + smooth(13.6, 14.4, journey.s) * 4;
    for (let i = 0; i < COUNT; i++) {
      const m = items.current[i]; if (!m) continue;
      const u = ((clock.elapsedTime * speed * 0.02 + i / COUNT) % 1);
      m.position.set(0, 1.4, 4 - u * 40);
      const stage = Math.min(STAGES.length - 1, Math.floor(u * STAGES.length));
      m.scale.set(1 + stage * 0.06, 1 + stage * 0.09, 1);
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + (stage / STAGES.length) * 1.2;
    }
    rings.current.forEach((r, i) => { if (r) r.rotation.z = clock.elapsedTime * 0.15 * (i % 2 ? 1 : -1); });
  });
  return (
    <group>
      <Floor />
      <mesh position={[0, 0.05, -16]}><boxGeometry args={[5, 0.1, 44]} /><meshStandardMaterial color="#101114" metalness={0.9} roughness={0.3} /></mesh>
      {STAGES.map((s, i) => (
        <group key={s} position={[0, 0, 2 - i * 4.2]}>
          <mesh ref={(el) => { rings.current[i] = el; }} position={[0, 2.8, 0]}><torusGeometry args={[3.4, 0.14, 10, 48]} /><meshStandardMaterial color={COLORS.graphite} metalness={0.8} roughness={0.35} emissive={COLORS.brass} emissiveIntensity={0.1 + i * 0.05} /></mesh>
          <Label position={[0, 6.7, 0]} size={0.38} color={i === STAGES.length - 1 ? COLORS.green : COLORS.white}>{s}</Label>
        </group>
      ))}
      {Array.from({ length: COUNT }).map((_, i) => (<mesh key={i} ref={(el) => { items.current[i] = el; }}><boxGeometry args={[1.2, 0.8, 1.6]} /><meshStandardMaterial color="#cfc9ba" emissive={COLORS.brass} emissiveIntensity={0.2} /></mesh>))}
      <pointLight position={[0, 6, -14]} intensity={90} color="#ffd9a0" />
    </group>
  );
}

/* ───────── WHO THIS IS FOR / NOT FOR ───────── */
export function Audience() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (g.current) g.current.children.forEach((c, i) => { c.position.y = Math.sin(clock.elapsedTime * 0.5 + i) * 0.05; }); });
  return (
    <group>
      <Floor />
      <group ref={g}>
        {FOR_WHO.map((w, i) => {
          const x = (i - (FOR_WHO.length - 1) / 2) * 2.7 + (i >= 4 ? 1.4 : -1.4);
          return (
            <group key={w} position={[x, 0, -2 - Math.abs(i - 3) * 0.6]}>
              <mesh position={[0, 1.3, 0]}><capsuleGeometry args={[0.45, 1.3, 6, 14]} /><meshStandardMaterial color="#0f1013" roughness={0.35} metalness={0.6} emissive={COLORS.brass} emissiveIntensity={0.05} /></mesh>
              <mesh position={[0, 2.85, 0]}><sphereGeometry args={[0.36, 18, 18]} /><meshStandardMaterial color="#0f1013" roughness={0.35} metalness={0.6} /></mesh>
              <Label position={[0, 3.9, 0]} size={0.17} color={COLORS.white} maxWidth={2.3}>{w.toUpperCase()}</Label>
            </group>
          );
        })}
      </group>
      <pointLight position={[0, 9, 6]} intensity={160} distance={34} color="#ffe6bf" />
    </group>
  );
}
export function NotFor() {
  return (
    <group>
      <Floor />
      {NOT_FOR.map((w, i) => (
        <group key={w} position={[(i - 1.5) * 6.2, 3.2, -3 - (i % 2) * 1.2]}>
          <mesh><boxGeometry args={[3.6, 5, 0.3]} /><meshStandardMaterial color="#1a1c21" metalness={0.7} roughness={0.4} emissive={COLORS.brass} emissiveIntensity={0.06} /></mesh>
          <Label position={[0, 0, 0.2]} size={0.34} color={COLORS.white}>{w.toUpperCase().replace('.', '')}</Label>
        </group>
      ))}
      <pointLight position={[0, 8, 6]} intensity={120} distance={30} color="#ffe6bf" />
    </group>
  );
}

/* ───────── THE FINANCIAL FREEDOM PLAN — an educational framework ───────── */
export function Plan() {
  const beams = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => beams.current.forEach((b, i) => { if (b) (b.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 1.2 + i); }));
  const rows = journey.mobile ? 7 : 12;
  return (
    <group>
      <Floor />
      {Array.from({ length: rows * 2 }).map((_, i) => {
        const r = Math.floor(i / 2); const side = i % 2 ? 1 : -1; const kind = (r + i) % 3;
        return (
          <group key={i} position={[side * (5 + (r % 3) * 2.2), 0, 2 - r * 5.2]}>
            <mesh position={[0, 0.9, 0]}><boxGeometry args={[2.4, 1.8, 2]} /><meshStandardMaterial color="#1a1c21" roughness={0.7} /></mesh>
            <mesh position={[0, 2.25, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.9, 0.9, 4]} /><meshStandardMaterial color="#101114" /></mesh>
            {kind === 0 && <mesh ref={(el) => { beams.current[i] = el; }} position={[0, 5, 0]}><cylinderGeometry args={[0.06, 0.06, 5, 6]} /><meshBasicMaterial color={COLORS.green} transparent toneMapped={false} /></mesh>}
            {kind === 1 && <mesh position={[0, 3.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.1, 0.04, 8, 40]} /><meshBasicMaterial color={COLORS.brass} toneMapped={false} /></mesh>}
          </group>
        );
      })}
      <Label position={[-7, 8, -6]} size={0.7} color={COLORS.brass}>FAST CASH</Label>
      <Label position={[7, 8, -22]} size={0.7} color={COLORS.green}>CASH FLOW</Label>
      <Label position={[-7, 8, -40]} size={0.7} color={COLORS.white}>LONG-TERM WEALTH</Label>
    </group>
  );
}

/* ───────── THE FINAL CONVERGENCE ───────── */
export function Convergence() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const N = journey.mobile ? 18 : 40;
  const seeds = useRef(Array.from({ length: N }, (_, i) => new THREE.Vector3(Math.sin(i * 12.9898) * 30, 2 + Math.cos(i * 4.1) * 12, 14 + Math.sin(i * 78.233) * 30))).current;
  const mark = useRef<any>(null);
  useFrame(({ clock }) => {
    const c = smooth(17.2, 17.85, journey.s);
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.lerpVectors(seeds[i], new THREE.Vector3(0, 2.2, 0), c);
      m.scale.setScalar(Math.max(0.001, 1 - c * 0.98));
      m.rotation.y = clock.elapsedTime * 0.3 + i;
    });
    if (mark.current) { mark.current.fillOpacity = smooth(17.85, 17.98, journey.s); mark.current.visible = mark.current.fillOpacity > 0.01; }
  });
  return (
    <group>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          {i % 3 === 0 ? <octahedronGeometry args={[0.6]} /> : i % 3 === 1 ? <boxGeometry args={[0.9, 0.6, 0.9]} /> : <boxGeometry args={[0.7, 0.9, 0.04]} />}
          <meshStandardMaterial color={i % 4 === 0 ? COLORS.brass : '#cfc9ba'} emissive={COLORS.brass} emissiveIntensity={0.4} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <Word3D size={1.7} position={[0, 6.8, -2]} color={COLORS.brass} fade={[17.85, 17.98, 99, 100]}>MR. TRANSACTION ENGINEER</Word3D>
    </group>
  );
}
