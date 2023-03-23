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

vec3 spectrum(float b) {
    // return vec3(b * 2.0, b * 1.5, b * 0.5);
      // return vec3(b, 0.2 * b * b, b * b);
  if(u_characterClass == 1.0) return vec3(b * 2.0, b * 1.5, b * 0.5);
  if(u_characterClass == 2.0) return vec3(b, 0.2 * b * b, b * b);
  if(u_characterClass == 3.0) return vec3(b * b, b * b * b * b, b);

  return vec3(b, b * b, b * b * b * b);
}



float getCoc(vec3 p) {
  return abs(length(p) - 0.5) * u_dof;
}

void main() {
  float t = u_time + aDelay * u_tailLength;

  vec3 p = aPos;
  p.y += t * u_windY;
  p.y = mod(p.y + 0.5, u_boxHeight) - 1.5;
  // p.y = fract(p.y  + 0.5) - 0.5;
  p += turbulence(p, t);

  vec4 modelPosition = modelMatrix * vec4(p, .065);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  float coc = getCoc(p);
  float size = u_pointSize * (aRandom1 + 0.5);
  gl_PointSize = size * (u_screenHeight) / gl_Position.w;
  gl_PointSize += coc;

  float phase = t * u_blink * (0.5 + aRandom0);
  float brightness = max(0.5 + sin(phase) + sin(phase * 1.618), 0.);

  // float brightness = sin(phase) + sin(phase * 1.618);


  float alpha = brightness * u_opacity * min(gl_PointSize, 1.0) * aRandom2;
  alpha *= p.y * 0. + 0.5;
  alpha /= 1. + coc;

  float gradient = 1. - ((gl_Position.y / gl_Position.w) * .5 + .5) * u_gradient;
  alpha *= gradient * gradient;

  vec3 c = spectrum(0.1 + aRandom3 * 0.8);
  vColor = vec4(c, alpha);

  vUv = uv;

}

