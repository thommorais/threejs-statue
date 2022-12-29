precision mediump float;
varying float vOpacity;
uniform sampler2D uTexture;

varying float vRotation;
varying vec2 vUv;

void main() {

  vec2 rotated = vec2(cos(vRotation / 2.) * (gl_PointCoord.x - 0.5) + sin(vRotation) * (gl_PointCoord.y - 0.5) + 0.5, cos(vRotation) * (gl_PointCoord.y - 0.5) - sin(vRotation) * (gl_PointCoord.x - 0.5) + 0.5);

  vec4 sparks = texture2D(uTexture, rotated);

  float red = 1.;

  float distBloom = length(rotated * smoothstep(0.25, .75, vUv));

  gl_FragColor = vec4(red, sparks.gb, sparks.a * vOpacity + distBloom);

}