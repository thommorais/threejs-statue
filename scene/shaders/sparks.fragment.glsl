precision mediump float;
varying float vOpacity;
varying vec3 vResolution;

varying float vRotation;
varying vec2 vUv;

void main() {

  vec2 rotated = vec2(cos(vRotation / 2.) * (gl_PointCoord.x - 0.5) + sin(vRotation) * (gl_PointCoord.y - 0.5) + 0.5, cos(vRotation) * (gl_PointCoord.y - 0.5) - sin(vRotation) * (gl_PointCoord.x - 0.5) + 0.5);

  float distBloom = length(rotated * smoothstep(0.25, .75, vUv));

  vec4 color = vec4(1., 0., 0., 0.15 + distBloom);

  gl_FragColor = color;

}