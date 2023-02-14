precision mediump float;
varying float vTime;
varying vec3 vResolution;
varying vec3 vRotation;
varying float vOpacity;
varying vec2 vUv;


void main(){

  // create Embers shape
  float dist = distance(gl_PointCoord, vec2(0.5));

  if (dist > 0.33) {
    discard;
  };

  // remove pixels from laterals
  if (gl_PointCoord.x < 0.33 || gl_PointCoord.x > 0.66) {
    discard;
  };

  // make it rotate based on vRotation
  float angle = vRotation.z;
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(
    gl_PointCoord.x * c - gl_PointCoord.y * s,
    gl_PointCoord.x * s + gl_PointCoord.y * c
  );

  // create rotation
  float distRotation = length(vUv - rotated);

  // create rotation fade
  float fadeRotation = smoothstep(0.0, 0.15, vOpacity);

  // create rotation color
  vec4 colorRotation = vec4(1. , 0.0, 0.0, fadeRotation);

  // create rotation color change
  colorRotation.r = colorRotation.r + (0.75 - colorRotation.r) * 0.5;

  // make the top of the embers more orange and the bottom more red

  colorRotation.g =  0.65 * (1.0 - gl_PointCoord.y);

  // make the embers with more z index less opaque

  vec4 color = colorRotation * distRotation;

  gl_FragColor = color;

}


