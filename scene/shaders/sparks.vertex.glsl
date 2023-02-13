precision mediump float;

attribute float aOpacity;
attribute float aScale;
attribute vec3 aRotation;
attribute vec3 aSpeed;

uniform float uTime;
uniform float uSize;
uniform float uGravity;
uniform vec3 uSpeed;
uniform vec3 uWorldSize;
uniform float uWind;

varying float vRotation;
varying float vOpacity;
varying vec2 vUv;

void main() {

  vec4 modelPosition = modelMatrix * vec4(position, 2.);

  modelPosition.x =  mod(modelPosition.x + uTime + uWind * (aSpeed.x + uSpeed.x), uWorldSize.x * 2.0) - uWorldSize.x;
  modelPosition.y =mod(modelPosition.y + uTime * 2. * (aSpeed.y + uSpeed.y) * uGravity, uWorldSize.y * 2.0) - uWorldSize.y;

  // modelPosition.x += (sin(uTime * aSpeed.z) * aRotation.z) + 0.01;
  // modelPosition.z += cos(uTime * aSpeed.z) * aRotation.z;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vOpacity = aOpacity;

  if(modelPosition.y > 25.) {
    float transitionPercent = modelPosition.y / 60.0;
    vOpacity = smoothstep(vOpacity, .0, transitionPercent);
  }

  if(modelPosition.y > 25.) {
    gl_PointSize = uSize * aScale - 2.;
  }



  vUv = uv;
  vRotation = 0.;

  gl_PointSize = (uSize - 2.) * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);
}