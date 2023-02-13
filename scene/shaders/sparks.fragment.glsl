precision mediump float;
varying float vOpacity;

varying float vRotation;
varying vec2 vUv;


void main() {

  vec2 rotated = vec2(cos(vRotation / 2.) * (gl_PointCoord.x - 0.5) + sin(vRotation) * (gl_PointCoord.y - 0.5) + 0.5, cos(vRotation) * (gl_PointCoord.y - 0.5) - sin(vRotation) * (gl_PointCoord.x - 0.5) + 0.5);

  float distBloom = length(rotated * smoothstep(0.25, .75, vUv));

   float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    #ifdef GL_OES_standard_derivatives
        delta = fwidth(r);
        alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    #endif

  vec4 color = vec4(1., 0., 0., 0.5 * alpha);

  gl_FragColor = color;

}