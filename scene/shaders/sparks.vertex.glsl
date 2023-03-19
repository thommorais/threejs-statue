precision mediump float;

attribute vec4 aData0;
attribute vec4 aData1;

#define aDelay aData0.w
#define aRandom0 aData1.x
#define aRandom1 aData1.y
#define aRandom2 aData1.z
#define aRandom3 aData1.w

uniform highp float _Time;
uniform float _Opacity;
uniform float _ScreenHeight;
uniform float _PointSize;
uniform float _TailLength;

uniform float _WindY;
uniform float _Amplitude;
uniform float _Falloff;
uniform float _Twist;
uniform float _SpatialFrequency;
uniform float _TemporalFrequency;
uniform float _BlinkFrequency;
uniform float _DOF;
uniform float _Gradient;

varying vec2 vUv;
varying vec4 vColor;

#define m3 mat3(-0.73736, 0.45628, 0.49808, 0, -0.73736, 0.67549, 0.67549, 0.49808, 0.54371)

vec3 sineNoise(in vec3 p) {
  vec3 q = p;
  vec3 c = vec3(0);
  float a = 1.;
  for (int i = 0; i < 6; i++) {
    q = m3 * q;
    vec3 s = sin(q.zxy / a) * a;
    q += s * _Twist;
    c += s;
    a *= _Falloff;
  }
  return c;
}

vec3 turbulence(vec3 p, float t) {
  p *= _SpatialFrequency;
  p += t * _TemporalFrequency;
  return sineNoise(p) * _Amplitude;
}

vec3 spectrum(float b) {
  return vec3(b, b * b, b * b * b * b);
}

float getCoc(vec3 p) {
  return abs(length(p) - 0.5) * _DOF;
}

void main() {
  float t = _Time + aDelay * _TailLength;

  vec3 p = position.xyz;
  p.y += t * _WindY;
  p.y = fract(p.y + 0.5) - 0.5;
  p += turbulence(p, t);

  vec4 modelPosition = modelMatrix * vec4(p, .065);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  float coc = getCoc(p);
  float size =_PointSize * (aRandom1 + 0.5);
  gl_PointSize = size * (_ScreenHeight * .5) / gl_Position.w;
  gl_PointSize += coc;

  float phase = t * _BlinkFrequency * (0.5 + aRandom0);
  float brightness = max(0.5 + sin(phase) + sin(phase * 1.618), 0.);

    float alpha = brightness * _Opacity * min(gl_PointSize, 1.0) * aRandom2;
    // alpha *= p.y * 0.0 + 0.5;
    alpha *= 0.5 - p.y * 0.5;
    alpha /= 1.0 + coc;

  float gradient = 1. - ((gl_Position.y / gl_Position.w) * .5 + .5) * _Gradient;
  alpha *= gradient * gradient;

  vec3 c = spectrum(0.1 +  aRandom3 * 0.8);
  vColor = vec4(c, alpha);

  vUv = uv;

}
