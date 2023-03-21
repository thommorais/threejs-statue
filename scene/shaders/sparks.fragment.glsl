precision mediump float;

varying vec4 vColor;

uniform float _Hardness;

varying vec3 vVelocity;

void main(void) {
  vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
  float l = length(uv);

  // Initialize the alpha value with the smoothstep function
  float a = smoothstep(1.0, _Hardness, l);
  a *= vColor.w;

  // Calculate the motion blur effect
  float numSteps = 5.0; // You can adjust this value to control the quality of the blur
  float blurStrength = 0.03; // You can adjust this value to control the strength of the blur
  vec2 velocityUV = (vVelocity.xy / vVelocity.z) * blurStrength;

  // Add the contributions of each step along the velocity vector
  for (float i = 0.0; i < numSteps; i++) {
    float stepRatio = i / numSteps;
    vec2 offset = stepRatio * -velocityUV;
    float stepAlpha = a * (1.0 - stepRatio);

    vec2 stepUV = uv + offset;
    float stepL = length(stepUV);
    float stepA = smoothstep(1.0, _Hardness, stepL);

    a += stepA * stepAlpha;
  }

  gl_FragColor = vec4(vColor.rgb * a, 1.0);
}