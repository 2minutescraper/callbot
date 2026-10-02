'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { STRATEGIES } from '@/lib/content';
import { DealViz } from '../DealViz';
import { COLORS, Floor, Label, Word3D, smooth } from '../three-kit';

export const ENGINE_RADIUS = 10;
const N = STRATEGIES.length;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/* ───────── THE 9-STRATEGY ENGINE ───────── */
export function Engine({ onSelect }: { onSelect: (i: number) => void }) {
  const ring = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const rot = useRef(0);
  const [hover, setHover] = useState<number | null>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }, dt) => {
    // the ring slowly turns; as the camera leaves, a gap opens on its path so it can fly through
    const spin = (journey.s - 5) * 0.55 + (journey.reduced ? 0 : clock.elapsedTime * 0.02);
    const gap = (8 * Math.PI) / 9; const w = smooth(5.45, 5.9, journey.s);
    const free = spin * (1 - w) + gap * w;
    const f = journey.focus;
    const target = f !== null ? Math.PI - (2 * Math.PI * f) / N : free;
    rot.current += wrap(target - rot.current) * (1 - Math.exp(-dt * 3));
    nodeRefs.current.forEach((g, k) => {
      if (!g) return;
      const th = (2 * Math.PI * k) / N + rot.current;
      g.position.set(Math.sin(th) * ENGINE_RADIUS, 2.4 + Math.sin(th * 2 + k) * 0.4, Math.cos(th) * ENGINE_RADIUS);
      g.rotation.y = th + Math.PI;
      const want = (f === k ? 1.55 : hover === k ? 1.15 : 1) * (f !== null && f !== k ? 0.75 : 1);
      g.scale.lerp(new THREE.Vector3(want, want, want), 1 - Math.exp(-dt * 6));
    });
    if (core.current) {
      core.current.rotation.y = clock.elapsedTime * 0.15;
      core.current.children.forEach((c, i) => { if (i > 0) c.rotation.x = clock.elapsedTime * (0.1 + i * 0.07); });
      core.current.scale.setScalar(0.9 + 0.1 * smooth(4.6, 5.0, journey.s));
    }
  });

  return (
    <group>
      <Floor />
      <Word3D size={7.5} position={[0, 9, -ENGINE_RADIUS - 4]} outline fade={[4.5, 4.95, 5.6, 6.1]}>STRATEGIES</Word3D>
      <group ref={core} position={[0, 2.4, 0]}>
        <mesh><icosahedronGeometry args={[0.9, 1]} /><meshStandardMaterial color={COLORS.brass} emissive={COLORS.brass} emissiveIntensity={1.1} roughness={0.3} metalness={0.8} wireframe /></mesh>
        {[1.7, 2.4, 3.1].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2 + i * 0.5, i * 0.4, 0]}><torusGeometry args={[r, 0.03, 8, 96]} /><meshBasicMaterial color={i === 1 ? COLORS.white : COLORS.brass} toneMapped={false} /></mesh>
        ))}
        <pointLight intensity={40} distance={30} color="#ffcf8a" />
      </group>
      <group ref={ring}>
        {STRATEGIES.map((s, k) => (
          <group key={s.id} ref={(el) => { nodeRefs.current[k] = el; }}>
            {/* hit target */}
            <mesh
              visible={false}
              onPointerOver={(e) => { e.stopPropagation(); setHover(k); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = ''; }}
              onClick={(e) => { e.stopPropagation(); onSelect(k); }}
            ><boxGeometry args={[5, 4.5, 1.5]} /></mesh>
            <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[2.6, 2.6, 0.05, 48]} /><meshStandardMaterial color="#0e0f12" metalness={0.8} roughness={0.35} transparent opacity={0.85} /></mesh>
            <DealViz graph={s.graph} scale={0.85} labels={false} />
            <Label position={[0, -2.1, 0.2]} size={0.34}>{`${String(s.n).padStart(2, '0')} · ${s.name.split(' · ')[0].toUpperCase()}`}</Label>
            <Label position={[0, -2.6, 0.2]} size={0.17} color={COLORS.brass}>{s.short.toUpperCase().replace(/→/g, '>')}</Label>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ───────── MULTIPLE WAYS TO GET PAID — one transaction, many paths ───────── */
export function Corridor() {
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const curves = useRef(
    STRATEGIES.map((_, i) => {
      const x = (i - (N - 1) / 2) * 3.8;
      return new THREE.CubicBezierCurve3(new THREE.Vector3(0, 1.2, 8), new THREE.Vector3(0, 1.2, -6), new THREE.Vector3(x * 0.55, 1.2 + (i % 3) * 0.7, -10), new THREE.Vector3(x, 1.2 + (i % 3) * 1.4, -32));
    }),
  );
  useFrame(({ clock }) => {
    pulses.current.forEach((p, i) => {
      if (!p) return;
      p.position.copy(curves.current[i].getPoint((clock.elapsedTime * 0.12 + i * 0.11) % 1));
    });
  });
  return (
    <group>
      <Floor />
      {curves.current.map((c, i) => (
        <group key={i}>
          <mesh><tubeGeometry args={[c, 64, 0.045, 6, false]} /><meshStandardMaterial color={COLORS.brass} emissive={COLORS.brass} emissiveIntensity={0.55} /></mesh>
          <mesh ref={(el) => { pulses.current[i] = el; }}><sphereGeometry args={[0.22, 14, 14]} /><meshBasicMaterial color={COLORS.white} toneMapped={false} /></mesh>
          <Label position={[c.v3.x, c.v3.y + 1.1, c.v3.z]} size={0.4}>{STRATEGIES[i].name.split(' · ')[0].toUpperCase()}</Label>
        </group>
      ))}
    </group>
  );
}

/* ───────── FIND DEALS NOBODY ELSE SEES ───────── */
const TAGS = ['MOTIVATED SELLER', 'MORTGAGE', 'PAYMENT', 'EQUITY', 'FORECLOSURE', 'TERMS', 'CONDITION', 'TIMING'];
// a street runs down the middle (x≈0) where the camera travels; glowing houses line it
const DARK = new THREE.Color('#2b2e35'); const BRASS = new THREE.Color('#b8935a');
const LIT: [number, number][] = [[-8.5, -4], [8.5, -11], [-8.5, -18], [8.5, -25], [-8.5, -32], [8.5, -39], [-8.5, -46], [8.5, -53]];
export function Neighborhood() {
  const cols = journey.mobile ? 9 : 17; const rows = journey.mobile ? 9 : 14;
  const glowers = useRef<THREE.Group[]>([]);
  const setup = (inst: THREE.InstancedMesh | null, roofy: boolean) => {
    if (!inst) return;
    const m = new THREE.Matrix4(); const p = new THREE.Vector3(); const q = new THREE.Quaternion(); const sc = new THREE.Vector3();
    let n = 0;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = (c - (cols - 1) / 2) * 5; const z = -r * 5 + 6;
      if (Math.abs(x) < 7) continue; // a wide street so nothing blocks the glowing houses
      if (LIT.some(([lx, lz]) => Math.abs(lx - x) < 3 && Math.abs(lz - z) < 3)) continue;
      const h = 1.6 + ((c * 7 + r * 13) % 5) * 0.25;
      if (roofy) { p.set(x, h + 0.55, z); q.setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)); sc.set(1, 1, 1); }
      else { p.set(x, h / 2, z); q.identity(); sc.set(2.6, h, 2.2); }
      m.compose(p, q, sc); inst.setMatrixAt(n++, m);
    }
    inst.count = n; inst.instanceMatrix.needsUpdate = true;
  };
  useFrame(({ clock }) => {
    const g = smooth(6.5, 7.3, journey.s);
    glowers.current.forEach((grp, i) => {
      if (!grp) return;
      const k = g * (0.75 + Math.sin(clock.elapsedTime * 1.4 + i) * 0.12);
      grp.children.forEach((c: any) => { const m = c.material; if (m?.color && c.userData.lit) m.color.copy(DARK).lerp(BRASS, Math.min(1, k * 1.15)); });
    });
  });
  return (
    <group>
      <Floor />
      <instancedMesh ref={(el) => setup(el, false)} args={[undefined, undefined, cols * rows]}><boxGeometry /><meshStandardMaterial color="#2b2e35" roughness={0.8} /></instancedMesh>
      <instancedMesh ref={(el) => setup(el, true)} args={[undefined, undefined, cols * rows]}><coneGeometry args={[1.9, 1.1, 4]} /><meshStandardMaterial color="#1b1d22" roughness={0.9} /></instancedMesh>
      {LIT.slice(0, TAGS.length).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} ref={(el) => { if (el) glowers.current[i] = el; }}>
          <mesh position={[0, 1, 0]} userData={{ lit: true }}><boxGeometry args={[2.6, 2, 2.2]} /><meshBasicMaterial color="#2b2e35" toneMapped={false} /></mesh>
          <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} userData={{ lit: true }}><coneGeometry args={[1.9, 1.1, 4]} /><meshBasicMaterial color="#2b2e35" toneMapped={false} /></mesh>
          <Label position={[0, 4.2, 0]} size={0.5} color={COLORS.brass}>{TAGS[i]}</Label>
        </group>
      ))}
    </group>
  );
}

/* ───────── THE SELLER CONVERSATION — fragments, never a fake transcript ───────── */
const FRAGS = ['SELLER', 'INVESTOR', 'QUESTIONS', 'MOTIVATION', 'OPTIONS', 'TERMS', 'AGREEMENT'];
export function Seller() {
  const frag = useRef<(THREE.Group | null)[]>([]);
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime; const a = smooth(7.8, 8.4, journey.s);
    FRAGS.forEach((_, i) => {
      const g = frag.current[i]; if (!g) return;
      const th = (i / FRAGS.length) * Math.PI * 2 + t * 0.12;
      g.position.set(-2.5 + Math.cos(th) * 5.2, 2.6 + Math.sin(th * 1.7 + i) * 1.4, Math.sin(th) * 3.2 - 0.5);
      g.scale.setScalar(a);
    });
    if (screen.current) screen.current.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.12 + smooth(7.9, 8.3, journey.s) * 0.5;
  });
  return (
    <group>
      <Floor />
      <group position={[-2.5, 2.2, 0]} rotation={[0, 0.25, 0.05]}>
        <mesh><boxGeometry args={[1.7, 3.4, 0.2]} /><meshStandardMaterial color="#0d0e10" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.11]}><planeGeometry args={[1.5, 3.1]} /><meshStandardMaterial ref={screen} color="#101418" emissive={COLORS.green} emissiveIntensity={0.5} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (<mesh key={i} position={[0, -0.9 + i * 0.5, 0.12]}><planeGeometry args={[0.9 - (i % 2) * 0.35, 0.05]} /><meshBasicMaterial color={COLORS.white} toneMapped={false} /></mesh>))}
      </group>
      {FRAGS.map((f, i) => (<group key={f} ref={(el) => { frag.current[i] = el; }}><Label position={[0, 0, 0]} size={0.55} color={i % 2 ? COLORS.brass : COLORS.white}>{f}</Label></group>))}
    </group>
  );
}
