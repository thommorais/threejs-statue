// precision mediump float;

// varying vec4 vColor;

// uniform float u_hardness;

// void main(void) {
//   vec2 uv = gl_PointCoord.xy * 2. - 1.;
//   float d = dot(uv, uv);
//   float mask = smoothstep(1. - u_hardness, 1., d);
//   gl_FragColor = vColor * (1. - mask);
// }


precision mediump float;

varying vec4 vColor;
uniform float u_hardness;

void main(void) {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float l = length(uv);
  float a = smoothstep(1.0, u_hardness, l) * vColor.w;

  gl_FragColor = vec4(vColor.xyz * a, 1.);
}
