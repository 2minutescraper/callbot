/** Mutable, non-reactive journey state read every frame by the camera, 3D scenes and DOM overlay. */
export const journey = {
  /** target progress along the path, in station units (0..LAST) */
  target: 0,
  /** damped progress actually used for rendering */
  s: 0,
  /** index of the strategy currently focused by the camera (0-based) or null */
  focus: null as number | null,
  /** 0..1 blend of the focus camera, lerped per frame */
  focusBlend: 0,
  reduced: false,
  mobile: false,
  ready: false,
};
