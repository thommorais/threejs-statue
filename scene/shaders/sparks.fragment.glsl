precision mediump float;

varying vec4 vColor;
uniform float u_hardness;

void main(void) {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float l = length(uv);
  float a = smoothstep(1.0, u_hardness, l) * vColor.w;

  gl_FragColor = vec4(vColor.xyz * a, 1.);
}
