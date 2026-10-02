'use client';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { journey } from '@/lib/store';
import { LAST, STATIONS, stationOrigin, ST } from '@/lib/journey';
import { ENGINE_RADIUS } from './scenes/Engine';

/** The camera is the main character: one spline for position, one for look-at, both driven by the master timeline. */
export function CameraRig() {
  const { camera, pointer } = useThree();
  const { pos, look } = useMemo(() => {
    const k = journey.mobile ? 1.18 : 1;
    const P: THREE.Vector3[] = []; const L: THREE.Vector3[] = [];
    STATIONS.forEach((s, i) => {
      const o = stationOrigin(i);
      P.push(new THREE.Vector3(o[0] + s.cam[0] * k, o[1] + s.cam[1], o[2] + s.cam[2] * k));
      L.push(new THREE.Vector3(o[0] + s.look[0], o[1] + s.look[1], o[2] + s.look[2]));
    });
    return { pos: new THREE.CatmullRomCurve3(P, false, 'catmullrom', 0.4), look: new THREE.CatmullRomCurve3(L, false, 'catmullrom', 0.4) };
  }, []);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3(), fp: new THREE.Vector3(), fl: new THREE.Vector3(), cur: new THREE.Vector3() }), []);

  useFrame(({ clock }, dt) => {
    const t = Math.min(1, Math.max(0, journey.s / LAST));
    pos.getPoint(t, tmp.p); look.getPoint(t, tmp.l);

    // strategy focus: dolly toward the selected node on the engine ring
    const want = journey.focus !== null ? 1 : 0;
    journey.focusBlend += (want - journey.focusBlend) * (1 - Math.exp(-dt * 3.2));
    if (journey.focusBlend > 0.001) {
      const o = stationOrigin(ST.engine);
      tmp.fp.set(o[0], o[1] + 2.5, o[2] - ENGINE_RADIUS + 5.6);
      tmp.fl.set(o[0], o[1] + 2.4, o[2] - ENGINE_RADIUS);
      tmp.p.lerp(tmp.fp, journey.focusBlend); tmp.l.lerp(tmp.fl, journey.focusBlend);
      tmp.p.y += Math.sin(Math.min(1, journey.focusBlend) * Math.PI) * 3.4; // arc over the engine core, never through it
    }

    if (!journey.reduced) {
      const sway = 1 - journey.focusBlend * 0.7;
      tmp.p.x += (Math.sin(clock.elapsedTime * 0.23) * 0.1 + pointer.x * 0.35) * sway;
      tmp.p.y += (Math.cos(clock.elapsedTime * 0.19) * 0.06 + pointer.y * 0.18) * sway;
    }
    camera.position.lerp(tmp.p, 1 - Math.exp(-dt * 10));
    tmp.cur.lerp(tmp.l, 1 - Math.exp(-dt * 10));
    if (tmp.cur.lengthSq() === 0) tmp.cur.copy(tmp.l);
    camera.lookAt(tmp.cur);
  });
  return null;
}
