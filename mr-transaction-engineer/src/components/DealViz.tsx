'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { NodeKind, StrategyGraph } from '@/lib/content';
import { COLORS, Label } from './three-kit';

const KIND_LABEL: Record<NodeKind, string> = {
  seller: 'SELLER', property: 'PROPERTY', mortgage: 'MORTGAGE', investor: 'INVESTOR', buyer: 'BUYER',
  cash: 'CASH', cashflow: 'CASH FLOW', equity: 'EQUITY', terms: 'TERMS', contract: 'CONTRACT', exit: 'EXIT',
};
const KIND_COLOR: Record<NodeKind, string> = {
  seller: '#d9d4c8', property: '#f2efe9', mortgage: '#8a919c', investor: '#b8935a', buyer: '#d9d4c8',
  cash: '#4f9a7a', cashflow: '#4f9a7a', equity: '#4f9a7a', terms: '#b8935a', contract: '#f2efe9', exit: '#b8935a',
};

function Shape({ kind }: { kind: NodeKind }) {
  const c = KIND_COLOR[kind];
  const m = <meshStandardMaterial color={c} roughness={0.35} metalness={0.5} emissive={c} emissiveIntensity={0.18} />;
  switch (kind) {
    case 'property':
      return (<group><mesh position={[0, -0.05, 0]}><boxGeometry args={[0.55, 0.4, 0.45]} />{m}</mesh><mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.46, 0.3, 4]} />{m}</mesh></group>);
    case 'mortgage': return <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.1, 12, 28]} />{m}</mesh>;
    case 'cash': case 'cashflow': return <mesh><cylinderGeometry args={[0.3, 0.3, 0.14, 24]} />{m}</mesh>;
    case 'equity': return <mesh><boxGeometry args={[0.4, 0.55, 0.4]} />{m}</mesh>;
    case 'contract': return <mesh><boxGeometry args={[0.42, 0.55, 0.05]} />{m}</mesh>;
    case 'terms': return <mesh><octahedronGeometry args={[0.34]} />{m}</mesh>;
    case 'exit': return <mesh rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.28, 0.5, 4]} />{m}</mesh>;
    case 'investor': return <mesh><icosahedronGeometry args={[0.32, 0]} />{m}</mesh>;
    default: return <mesh><sphereGeometry args={[0.3, 20, 20]} />{m}</mesh>; // seller, buyer
  }
}

/**
 * Reusable deal visualization: transaction elements joined by animated lines.
 * Positions are lerped when the graph changes, so one component can re-arrange itself per strategy.
 */
export function DealViz({ graph, scale = 1, labels = true, pulse = true, depth = 0 }: { graph: StrategyGraph; scale?: number; labels?: boolean; pulse?: boolean; depth?: number }) {
  const pos = useMemo(() => {
    const m = new Map<string, THREE.Vector3>();
    graph.nodes.forEach((n, i) => m.set(n.id, new THREE.Vector3(n.p[0], n.p[1], depth ? Math.sin(i * 2.1) * depth : 0)));
    return m;
  }, [graph, depth]);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (!pulse) return;
    graph.edges.forEach((e, i) => {
      const a = pos.get(e[0]); const b = pos.get(e[1]); const p = pulses.current[i];
      if (!a || !b || !p) return;
      const t = (clock.elapsedTime * 0.35 + i * 0.27) % 1;
      p.position.lerpVectors(a, b, t);
    });
  });
  return (
    <group scale={scale}>
      {graph.nodes.map((n) => (
        <group key={n.id} position={pos.get(n.id)!}>
          <Shape kind={n.kind} />
          {labels && <Label position={[0, -0.62, 0]} size={0.17}>{KIND_LABEL[n.kind]}</Label>}
        </group>
      ))}
      {graph.edges.map((e, i) => (
        <group key={e.join('-')}>
          <Line points={[pos.get(e[0])!, pos.get(e[1])!]} color={COLORS.brass} lineWidth={1.2} transparent opacity={0.7} />
          {pulse && (
            <mesh ref={(el) => { pulses.current[i] = el; }}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshBasicMaterial color={COLORS.white} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
