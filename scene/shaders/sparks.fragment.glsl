precision mediump float;
varying float vOpacity;
uniform sampler2D uTexture;

varying float vRotation;
varying vec4 vPosition;
varying float vTime;

void main() {

  vec2 rotated = vec2(cos(vRotation / 2.) * (gl_PointCoord.x - 0.5) + sin(vRotation) * (gl_PointCoord.y - 0.5) + 0.5, cos(vRotation) * (gl_PointCoord.y - 0.5) - sin(vRotation) * (gl_PointCoord.x - 0.5) + 0.5);

  vec4 sparks = texture2D(uTexture, rotated);

  float transitionPercent = vPosition.y / 100.0;

  if(vPosition.y > 24.) {
    float alpha = smoothstep(vOpacity, 0.0, transitionPercent);
    gl_FragColor = vec4(sparks.rgb, sparks.a * alpha);
  } else {
    gl_FragColor = vec4(sparks.rgb, sparks.a * vOpacity);
  }

  // gl_FragColor = vec4(sparks.rgb, sparks.a * transitionPercent);

}