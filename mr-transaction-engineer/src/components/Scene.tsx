'use client';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { ST } from '@/lib/journey';
import { CameraRig } from './CameraRig';
import { Stage, COLORS } from './three-kit';
import { Lab, Opportunity, Conventional, Structure, Eddie } from './scenes/Act1';
import { Engine, Corridor, Neighborhood, Seller } from './scenes/Engine';
import { Analyzer, Implementation, SummitDay, Factory, Audience, NotFor, Plan, Convergence } from './scenes/Act3';

type Props = { onStrategy: (i: number) => void; onResource: (id: string) => void; onReady: () => void };

export default function Scene({ onStrategy, onResource, onReady }: Props) {
  const mobile = journey.mobile;
  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: mobile ? 58 : 44, near: 0.1, far: 260, position: [0, 3.4, 15] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={() => onReady()}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <color attach="background" args={[COLORS.bg]} />
      <fog attach="fog" args={[COLORS.bg, 18, mobile ? 70 : 95]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#6b7280', '#050506', 0.4]} />
      <directionalLight position={[8, 14, 10]} intensity={0.8} color="#ffe9c9" />
      <Suspense fallback={null}>
        <CameraRig />
        <Stage at={ST.lab}><Lab /></Stage>
        <Stage at={ST.opportunity}><Opportunity /></Stage>
        <Stage at={ST.conventional}><Conventional /></Stage>
        <Stage at={ST.structure}><Structure /></Stage>
        <Stage at={ST.eddie} range={2.2}><Eddie /></Stage>
        <Stage at={ST.engine}><Engine onSelect={onStrategy} /></Stage>
        <Stage at={ST.corridor}><Corridor /></Stage>
        <Stage at={ST.neighborhood}><Neighborhood /></Stage>
        <Stage at={ST.seller}><Seller /></Stage>
        <Stage at={ST.analyzer}><Analyzer /></Stage>
        <Stage at={ST.implementation}><Implementation onSelect={onResource} /></Stage>
        <Stage at={ST.day1}><SummitDay day={1} /></Stage>
        <Stage at={ST.day2}><SummitDay day={2} /></Stage>
        <Stage at={ST.day3}><SummitDay day={3} /></Stage>
        <Stage at={ST.factory} range={1.1}><Factory /></Stage>
        <Stage at={ST.audience}><Audience /></Stage>
        <Stage at={ST['not-for']}><NotFor /></Stage>
        <Stage at={ST.plan}><Plan /></Stage>
        <Stage at={ST.final} range={1.4}><Convergence /></Stage>
        <Preload all />
      </Suspense>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
