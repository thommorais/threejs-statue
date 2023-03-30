precision mediump float;

attribute vec4 aData0;
attribute vec4 aData1;

#define aPos aData0.xyz
#define aDelay aData0.w
#define aRandom0 aData1.x
#define aRandom1 aData1.y
#define aRandom2 aData1.z
#define aRandom3 aData1.w

uniform highp float u_time;
uniform float u_opacity;
uniform float u_screenHeight;
uniform float u_pointSize;
uniform float u_tailLength;

uniform float u_windY;
uniform float u_amplitude;
uniform float u_falloff;
uniform float u_twist;
uniform float u_spatialFrequency;
uniform float u_temporalFrequency;
uniform float u_blink;
uniform float u_dof;
uniform float u_gradient;
uniform float u_boxHeight;
uniform float u_characterClass;

varying vec2 vUv;
varying vec4 vColor;

#define m3 mat3(-0.73736, 0.45628, 0.49808, 0, -0.73736, 0.67549, 0.67549, 0.49808, 0.54371)

vec3 sineNoise(in vec3 p) {
  vec3 q = p;
  vec3 c = vec3(0);
  float a = 1.;
  for(int i = 0; i < 6; i++) {
    q = m3 * q;
    vec3 s = sin(q.zxy / a) * a;
    q += s * u_twist;
    c += s;
    a *= u_falloff;
  }
  return c;
}

vec3 turbulence(vec3 p, float t) {
  p *= u_spatialFrequency;
  p += t * u_temporalFrequency;
  return sineNoise(p) * u_amplitude;
}

vec3 spectrum(float b, float c) {
    return (c == 1.0) ? vec3(b * 2.0, b * 1.5, b * 0.5) :
           (c == 2.0) ? vec3(b, 0.2 * b * b, b * b) :
                                       vec3(b, b * b, b * b * b * b);
}


float getCoc(vec3 p) {
  return abs(length(p) - 0.5) * u_dof;
}

void main() {
  float t = u_time + aDelay * u_tailLength;

  float cc = u_characterClass;
  bool mage = cc == 1.0;
  bool barbarian = cc == 2.0;
  bool demon = cc == 0.0;

  float cy = barbarian ? 1.5 : mage ? 1.0 : 3.0;

  vec3 p = aPos;
  p.y += t * u_windY;
  p.y = mod(p.y + 0.5, u_boxHeight) - 1.5;
  p += turbulence(p, t);

  vec4 modelPosition = modelMatrix * vec4(p, .065);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  float coc = getCoc(p);
  float size = u_pointSize * (aRandom1 + 0.5);
  gl_PointSize = size * (u_screenHeight) / gl_Position.w;
  gl_PointSize += coc;

  float phase = t * u_blink * (0.5 + aRandom0);
  float brightness = max(0.5 + sin(phase) + sin(phase * 1.618), 0.);

  float alpha = brightness * u_opacity * min(gl_PointSize, 1.0) * aRandom2;
  alpha *= 0.5 - p.y * 0.005;
  alpha /= 1. + coc;

  float gradient = 1. - (((gl_Position.y * cy) / gl_Position.w) * .5 + .5) * u_gradient;
  alpha *= gradient * gradient;


  vec3 c = spectrum(0.1 + aRandom3 * 0.8, cc);
  vColor = vec4(c, alpha);

  vUv = uv;

}

