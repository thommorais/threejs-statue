precision mediump float;

varying vec4 vColor;
uniform float _Hardness;
varying vec2 vUv;

void main(void) {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float l = length(uv);
  float d = max(1.0 - l, 0.0);
  float a = smoothstep(1.0, _Hardness, l) * vColor.w;

  gl_FragColor = vec4(vColor.xyz, a);
}
