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

  vec4 modelPosition = modelMatrix * vec4(position, 1.5);

  modelPosition.x = mod(modelPosition.x + uTime + uWind * (aSpeed.x + uSpeed.x), uWorldSize.x * 2.0) - uWorldSize.x;
  modelPosition.y = mod(modelPosition.y + uTime * (aSpeed.y + uSpeed.y) * uGravity, uWorldSize.y * 2.0) - uWorldSize.y;

  modelPosition.x += (sin(uTime * aSpeed.z) * aRotation.z) + 0.01;
  modelPosition.z += cos(uTime * aSpeed.z) * aRotation.z;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vOpacity = aOpacity;

  if(modelPosition.y > 24.) {
    float transitionPercent = modelPosition.y / 100.0;
    vOpacity = smoothstep(vOpacity, 0.0, transitionPercent);
  }

  vUv = uv;
  vRotation = 0.2;

  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);
}